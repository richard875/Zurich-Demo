import { post as postApplication } from '@api/applications';
import {
  applicationResultSchema,
  type ApplicationRequest,
  type ApplicationResult,
} from '@shared/application';
import { friendlyError } from '@/lib/friendly-error';

export async function submitApplication(request: ApplicationRequest): Promise<ApplicationResult> {
  let body: unknown;
  try {
    body = await postApplication({ data: request });
  } catch (error) {
    throw new Error(friendlyError(error), { cause: error });
  }
  const parsed = applicationResultSchema.safeParse(body);
  if (!parsed.success) throw new Error('Something went wrong. Please try again.');
  return parsed.data;
}
