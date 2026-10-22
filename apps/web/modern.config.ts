import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), bffPlugin()],
  server: {
    ssr: true,
  },
  html: {
    title: 'Zurich Direct (demo)',
    meta: {
      robots: 'noindex,nofollow',
      description: 'This is a Demo site and not the live Zurich Direct site.',
    },
  },
});
