import { apiErrorSchema } from '@shared/quote';

const fallback = 'Something went wrong. Please try again.';

// BFF calls throw the failed Response with its parsed JSON body attached as `data`.
export function friendlyError(error: unknown): string {
  if (!(error instanceof Response)) return fallback;
  if (error.status === 400) return 'Please check your details and try again.';
  const body = apiErrorSchema.safeParse((error as Response & { data?: unknown }).data);
  return body.success ? body.data.message : fallback;
}
