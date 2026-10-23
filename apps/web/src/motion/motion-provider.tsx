import type { ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { duration, ease } from './tokens';

// Motion's animation features arrive once the page has loaded, so they never compete with what the
// page shows first. Until then a change happens at once.
const pageLoaded = () =>
  new Promise<void>((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', () => resolve(), { once: true });
  });

const loadFeatures = () =>
  pageLoaded()
    .then(() => import('./features'))
    .then((features) => features.default);

// Motion's m components load their features from here; motion components are refused (strict).
// Motion follows the device's reduced-motion setting, and animates on zurich.com.au's curve by
// default. Only the quote steps use Motion, so only that page loads it (step-transition.tsx).
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig
        reducedMotion="user"
        transition={{ duration: duration.enter, ease: ease.entrance }}
      >
        {children}
      </MotionConfig>
    </LazyMotion>
  );
}
