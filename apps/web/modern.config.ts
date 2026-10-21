import { appTools, defineConfig } from '@modern-js/app-tools';
import { bffPlugin } from '@modern-js/plugin-bff';

// https://modernjs.dev/en/configure/app/usage
export default defineConfig({
  plugins: [appTools(), bffPlugin()],
  server: {
    ssr: true,
  },
  html: {
    title: 'Zurich Life Direct (demo)',
    meta: {
      robots: 'noindex,nofollow',
      description: 'Demo only. Not a real Zurich product.',
    },
  },
});
