import { useState, type ReactNode } from 'react';
import { AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import * as m from 'motion/react-m';
import { MotionProvider } from './motion-provider';
import { duration, ease } from './tokens';

// How far a new step slides in, from the side it's coming from.
const SLIDE = 24;

interface Move {
  direction: 1 | -1;
  reduce: boolean;
}

const variants: Variants = {
  enter: ({ direction, reduce }: Move) => ({
    opacity: 0,
    transform: reduce ? 'none' : `translateX(${direction * SLIDE}px)`,
  }),
  center: ({ reduce }: Move) => ({
    opacity: 1,
    transform: 'none',
    transition: { duration: reduce ? duration.switchOut : duration.switchIn, ease: ease.entrance },
    transitionEnd: { transform: 'none' },
  }),
  exit: { opacity: 0, transition: { duration: duration.switchOut, ease: ease.state } },
};

// The old step fades out, then the new one fades in, sliding 24px from the right going forward and
// from the left going back. With reduced motion, both only fade, over 150ms. The first step shown
// doesn't animate. The step area clips sideways, so the slide never widens the page on phones. The
// clip sits 1rem outside the content (negative margin, matching padding), so the cards' ring borders
// and focus rings stay visible; Safari ignores overflow-clip-margin, so that can't do it.
export function StepTransition({ step, children }: { step: number; children: ReactNode }) {
  const reduce = useReducedMotion() ?? false;
  const [shown, setShown] = useState<{ step: number; direction: 1 | -1 }>({ step, direction: 1 });
  if (shown.step !== step) setShown({ step, direction: step > shown.step ? 1 : -1 });
  const move: Move = { direction: shown.direction, reduce };

  return (
    <MotionProvider>
      <AnimatePresence mode="wait" initial={false} custom={move}>
        <m.div
          key={step}
          custom={move}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="-mx-4 overflow-x-clip px-4"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </MotionProvider>
  );
}
