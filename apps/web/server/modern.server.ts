import { defineServerConfig, type MiddlewareHandler } from '@modern-js/server-runtime';

// Pairs with the robots meta tag so no page or API response gets indexed.
const noIndex: MiddlewareHandler = async (c, next) => {
  await next();
  c.header('X-Robots-Tag', 'noindex, nofollow');
};

export default defineServerConfig({
  middlewares: [{ name: 'no-index', handler: noIndex }],
});
