import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), bffPlugin()],
  server: {
    ssr: true,
    // Its logger prints two debug lines for every request, static files and health checks
    // included. The app logs requests itself, and takes Modern.js's warnings and errors from its
    // monitors (server/request-log.ts).
    logger: false,
  },
  output: {
    // Don't emit application source maps into the public static directory.
    sourceMap: process.env.NODE_ENV === 'development',
  },
  html: {
    title: 'Zurich Direct (demo)',
    meta: {
      // Modern.js's default also sets maximum-scale=1 and user-scalable=no, which stops pinch zoom.
      viewport: 'width=device-width,initial-scale=1,viewport-fit=cover',
      robots: 'noindex,nofollow',
      description: 'This is a Demo site and not the live Zurich Direct site.',
    },
  },
});
