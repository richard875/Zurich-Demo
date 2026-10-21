import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { create } from 'zustand';
import { currentSession, signIn, signOut } from '@api/session';
import { sessionSchema, type Session } from '@shared/session';
import { friendlyError } from '@/lib/friendly-error';

export const sessionQueryKey = ['session'] as const;

async function parseSession(request: () => Promise<unknown>): Promise<Session> {
  let body: unknown;
  try {
    body = await request();
  } catch (error) {
    throw new Error(friendlyError(error), { cause: error });
  }
  return sessionSchema.parse(body);
}

export function useSession() {
  return useQuery({ queryKey: sessionQueryKey, queryFn: () => parseSession(currentSession) });
}

// FingerprintJS is only downloaded when someone actually signs in.
async function signInWithFingerprint(): Promise<Session> {
  const { load } = await import('@fingerprintjs/fingerprintjs');
  const agent = await load({ monitoring: false });
  const { visitorId } = await agent.get();
  return parseSession(() => signIn({ data: { visitorId } }));
}

export function useSignIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: signInWithFingerprint,
    onSuccess: (session) => queryClient.setQueryData(sessionQueryKey, session),
  });
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => parseSession(signOut),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryKey, session);
      queryClient.removeQueries({ queryKey: ['policies'] });
    },
  });
}

interface SignInDialogState {
  open: boolean;
  // Where to go once signed in; null stays on the current page.
  destination: string | null;
  request: (destination?: string) => void;
  close: () => void;
}

export const useSignInDialog = create<SignInDialogState>()((set) => ({
  open: false,
  destination: null,
  request: (destination) => set({ open: true, destination: destination ?? null }),
  close: () => set({ open: false, destination: null }),
}));
