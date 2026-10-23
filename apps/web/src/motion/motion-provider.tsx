import { useSyncExternalStore, type ReactNode } from 'react';
import { LazyMotion, MotionConfig } from 'motion/react';
import { duration, ease } from './tokens';

// Motion's animation features arrive after the first render. Until they have, reveals hide nothing,
// so a slow or failed chunk leaves the page as it is without motion.
let featuresLoaded = false;
const listeners = new Set<() => void>();

const loadFeatures = () =>
  import('./features').then((features) => {
    featuresLoaded = true;
    for (const listener of listeners) listener();
    return features.default;
  });

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// False on the server, during hydration, and until the features have loaded.
export function useMotionReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => featuresLoaded,
    () => false,
  );
}

// Every m component loads its features from here; motion components are refused (strict). Motion
// follows the device's reduced-motion setting, and animates on zurich.com.au's curve by default.
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
