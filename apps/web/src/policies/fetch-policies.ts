import { get as getPolicies } from '@api/policies';
import { policiesSchema, type Policy } from '@shared/application';
import { friendlyError } from '@/lib/friendly-error';

export const policiesQueryKey = ['policies'] as const;

export async function fetchPolicies(): Promise<Policy[]> {
  let body: unknown;
  try {
    body = await getPolicies();
  } catch (error) {
    throw new Error(friendlyError(error), { cause: error });
  }
  return policiesSchema.parse(body).policies;
}
