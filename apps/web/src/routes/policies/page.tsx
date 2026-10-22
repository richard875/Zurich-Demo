import { useEffect, useRef, useState } from 'react';
import { Helmet } from '@modern-js/runtime/head';
import { Link } from '@modern-js/runtime/router';
import { useQuery } from '@tanstack/react-query';
import type { Policy } from '@shared/application';
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
        <p className="text-muted-foreground">Loading your policies…</p>
      ) : policies.isError ? (
        <p role="alert" className="border-l-4 border-peach py-1 pl-4 font-medium">
          {policies.error.message}
        </p>
      ) : policies.data.length === 0 ? (
        <div className="grid justify-items-start gap-4">
          <p className="text-lg">You haven't applied for cover yet.</p>
          <Button asChild>
            <Link to="/quote">Get a quote</Link>
          </Button>
        </div>
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-16">
      <Helmet>
        <title>My policies | Zurich Direct (demo)</title>
      </Helmet>
      <h1>My policies</h1>
      <div className="mt-10">
        <RequireSession reason="Sign in to see your policies.">
          <Policies />
        </RequireSession>
      </div>
    </div>
  );
}
