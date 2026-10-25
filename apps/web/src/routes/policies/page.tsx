import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Link, useLocation } from '@modern-js/runtime/router';
import { useQuery } from '@tanstack/react-query';
import type { Policy } from '@shared/application';
import { Headline } from '@/components/headline';
import { ErrorAlert, LoadingPanel, MessagePanel } from '@/components/message-panel';
import { FlowLayout, PageBand } from '@/components/page-band';
import { phones } from '@/components/site/links';
import { TalkCard } from '@/components/site/talk-card';
import { Button } from '@/components/ui/button';
import { Loaded, useWasLoading } from '@/motion/loaded';
import { fetchPolicies, policiesQueryKey } from '@/policies/fetch-policies';
import { PolicyCard } from '@/policies/policy-card';
import { RequireSession } from '@/session/require-session';

// Announces Processing -> Active once, rather than re-reading the list on every poll, and keeps the
// policies that turned active while the page was open, so their pills can confirm it. Policies already
// active when the page loads are left out. A layout effect, so a pill never shows Mint for a frame
// before it fades from Lemon.
function useActivations(policies: Policy[] | undefined) {
  const previous = useRef(new Map<string, Policy['status']>());
  const [message, setMessage] = useState('');
  const [activated, setActivated] = useState<string[]>([]);
  useLayoutEffect(() => {
    if (!policies) return;
    const now = policies.filter(
      (p) => p.status === 'ACTIVE' && previous.current.get(p.applicationId) === 'PROCESSING',
    );
    if (now[0]) {
      setMessage(`Your policy ${now[0].policyNumber ?? ''} is now active.`);
      setActivated((ids) => [...ids, ...now.map((p) => p.applicationId)]);
    }
    previous.current = new Map(policies.map((p) => [p.applicationId, p.status]));
  }, [policies]);
  return { message, activated };
}

function Policies() {
  const policies = useQuery({
    queryKey: policiesQueryKey,
    queryFn: fetchPolicies,
    // Poll every 2 seconds while anything is still being set up.
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.status === 'PROCESSING') ? 2000 : false,
  });
  const { message, activated } = useActivations(policies.data);
  const wasLoading = useWasLoading(policies.isPending);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
      {policies.isPending ? (
        <LoadingPanel label="Loading your policies…" blocks={2} />
      ) : policies.data && policies.data.length > 0 ? (
        // A poll that fails keeps the list it already has, and polling carries on.
        // The cards bring themselves in (PolicyCard).
        <ul className="grid gap-6">
          {policies.data.map((policy, index) => (
            <PolicyCard
              key={policy.applicationId}
              policy={policy}
              revealIndex={index}
              justActivated={activated.includes(policy.applicationId)}
            />
          ))}
        </ul>
      ) : (
        <Loaded fade={wasLoading}>
          {policies.isError ? (
            <ErrorAlert>{policies.error.message}</ErrorAlert>
          ) : (
            <MessagePanel
              icon="document-contract:line"
              action={
                <Button asChild size="md">
                  <Link to="/quote">Get a quote</Link>
                </Button>
              }
            >
              You haven't applied for cover yet.
            </MessagePanel>
          )}
        </Loaded>
      )}
    </>
  );
}

export default function PoliciesPage() {
  // Start at the top on every visit, "My policies" in the header included, even from this page:
  // each navigation gets a new key, though the URL doesn't change.
  // Braces matter: newer Chrome returns a Promise from scrollTo, which React would call as cleanup.
  const { key } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [key]);

  return (
    <>
      <Helmet>
        <title>My policies | Zurich Direct (demo)</title>
      </Helmet>
      <PageBand>
        <Headline as="h1" size="page">
          My <em>policies</em>
        </Headline>
        <p className="mt-6 text-b-20">Everything you've applied for, and where it's up to.</p>
      </PageBand>
      <FlowLayout
        aside={
          <TalkCard phone={phones.customerCare}>
            Existing customers can call our Customer Care team.
          </TalkCard>
        }
      >
        <RequireSession reason="Sign in to see your policies.">
          <Policies />
        </RequireSession>
      </FlowLayout>
    </>
  );
}
