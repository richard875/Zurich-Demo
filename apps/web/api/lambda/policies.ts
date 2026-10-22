import { Api, Get } from '@modern-js/plugin-bff/server';
import { useHonoContext } from '@modern-js/server-runtime';
import { listApplications } from './_lib/application-store';
import { errorResponse } from './_lib/responses';

export const get = Api(Get('/policies'), async () => {
  const c = useHonoContext();
  const customerId = c.get('customerId');
  // The session middleware already returns 401 here; this narrows the type.
  if (!customerId) return errorResponse(401, 'Please sign in to continue.');

  try {
    return { policies: await listApplications(customerId) };
  } catch (error) {
    c.get('logger').error({ err: error }, 'listing policies failed');
    return errorResponse(500, "We couldn't load your policies just now. Please try again.");
  }
});
