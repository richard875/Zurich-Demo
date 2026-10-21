import { Api, Data, Delete, Get, Post } from '@modern-js/plugin-bff/server';
import { deleteCookie, setCookie, useHonoContext } from '@modern-js/server-runtime';
import { signInSchema, type Session } from '@shared/session';
import { getEnv } from './_lib/env';
import {
  customerIdFor,
  deviceLabelFor,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
  signSession,
} from './_lib/session';

const cookieOptions = () => ({
  httpOnly: true,
  sameSite: 'Lax' as const,
  path: '/',
  secure: getEnv().COOKIE_SECURE,
});

export const signIn = Api(Post('/session'), Data(signInSchema), async ({ data }) => {
  const c = useHonoContext();
  const customerId = customerIdFor(data.visitorId);
  const { value, expiresAt } = signSession(customerId, getEnv().SESSION_SECRET);
  setCookie(c, SESSION_COOKIE, value, {
    ...cookieOptions(),
    maxAge: SESSION_TTL_SECONDS,
    expires: new Date(expiresAt * 1000),
  });
  c.get('logger').info({ customerId }, 'signed in');
  const session: Session = { signedIn: true, customerId, deviceLabel: deviceLabelFor(customerId) };
  return session;
});

export const currentSession = Api(Get('/session'), async () => {
  const customerId = useHonoContext().get('customerId');
  const session: Session = customerId
    ? { signedIn: true, customerId, deviceLabel: deviceLabelFor(customerId) }
    : { signedIn: false };
  return session;
});

export const signOut = Api(Delete('/session'), async () => {
  const c = useHonoContext();
  deleteCookie(c, SESSION_COOKIE, cookieOptions());
  const session: Session = { signedIn: false };
  return session;
});
