import { useEffect, useRef, useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Link } from '@modern-js/runtime/router';
import { useQuery } from '@tanstack/react-query';
import type { Policy } from '@shared/application';
import { Headline } from '@/components/headline';
import { ErrorAlert, LoadingPanel, MessagePanel } from '@/components/message-panel';
import { FlowLayout, PageBand } from '@/components/page-band';
import { phones } from '@/components/site/links';
import { TalkCard } from '@/components/site/talk-card';
import { Button } from '@/components/ui/button';
import { fetchPolicies, policiesQueryKey } from '@/policies/fetch-policies';
import { PolicyCard } from '@/policies/policy-card';
import { RequireSession } from '@/session/require-session';

// Announces Processing -> Active once, rather than re-reading the list on every poll.
function useActivationAnnouncement(policies: Policy[] | undefined): string {
  const previous = useRef(new Map<string, Policy['status']>());
  const [message, setMessage] = useState('');
  useEffect(() => {
    if (!policies) return;
    const activated = policies.find(
      (p) => p.status === 'ACTIVE' && previous.current.get(p.applicationId) === 'PROCESSING',
    );
    if (activated) setMessage(`Your policy ${activated.policyNumber ?? ''} is now active.`);
    previous.current = new Map(policies.map((p) => [p.applicationId, p.status]));
  }, [policies]);
  return message;
}

function Policies() {
  const policies = useQuery({
    queryKey: policiesQueryKey,
    queryFn: fetchPolicies,
    // Poll every 2 seconds while anything is still being set up.
    refetchInterval: (query) =>
      query.state.data?.some((p) => p.status === 'PROCESSING') ? 2000 : false,
  });
  const announcement = useActivationAnnouncement(policies.data);

  return (
    <>
      <p className="sr-only" aria-live="polite">
        {announcement}
      </p>
      {policies.isPending ? (
        <LoadingPanel label="Loading your policies…" blocks={2} />
      ) : policies.isError ? (
        <ErrorAlert>{policies.error.message}</ErrorAlert>
      ) : policies.data.length === 0 ? (
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
      ) : (
        <ul className="grid gap-6">
          {policies.data.map((policy) => (
            <PolicyCard key={policy.applicationId} policy={policy} />
          ))}
        </ul>
      )}
    </>
  );
}

export default function PoliciesPage() {
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
