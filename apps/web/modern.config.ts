import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), bffPlugin()],
  server: {
    ssr: true,
  },
  output: {
    // Don't emit application source maps into the public static directory.
    sourceMap: process.env.NODE_ENV === 'development',
  },
  html: {
    title: 'Zurich Direct (demo)',
    meta: {
      robots: 'noindex,nofollow',
      description: 'This is a Demo site and not the live Zurich Direct site.',
    },
  },
});
