import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useReducedMotion, type Variants } from 'motion/react';
import * as m from 'motion/react-m';
import { useHydrated } from '@/lib/use-hydrated';
import { useMotionReady } from './motion-provider';
import { distance, duration, stagger } from './tokens';

// Motion goes on the element itself, so a card in a grid gets no extra box around it.
const elements = { div: m.div, section: m.section, article: m.article, li: m.li };

interface RevealProps {
  as?: keyof typeof elements;
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
}

// zurich.com.au's trigger: 10% of it on screen, ignoring the bottom tenth of the screen; once.
const viewport = { once: true, amount: 0.1, margin: '0px 0px -10% 0px' } as const;

// From md, things rise as they fade in and groups stagger; on phones they fade in place.
const wideQuery = '(min-width: 48rem)';
const subscribeWide = (listener: () => void) => {
  const query = window.matchMedia(wideQuery);
  query.addEventListener('change', listener);
  return () => query.removeEventListener('change', listener);
};
function useWide(): boolean {
  return useSyncExternalStore(
    subscribeWide,
    () => window.matchMedia(wideQuery).matches,
    () => false,
  );
}

// Nothing moves on the server, during hydration, before Motion's features arrive, or with reduced
// motion. Until then a reveal renders exactly what the page would without it.
function useLive(): boolean {
  const hydrated = useHydrated();
  const ready = useMotionReady();
  const reduce = useReducedMotion();
  return hydrated && ready && !reduce;
}

interface Timing {
  rise: boolean;
  delay: number;
  instant: boolean;
  seconds: number;
}

const revealVariants: Variants = {
  hidden: ({ rise }: Timing) => ({
    opacity: 0,
    transform: rise ? `translateY(${distance.rise}px)` : 'none',
    transition: { duration: 0 },
  }),
  // Motion ends a transform at translateY(0px); transitionEnd clears it, so a revealed block keeps no
  // transform (and no stacking context) of its own.
  shown: ({ delay, instant, seconds }: Timing) => ({
    opacity: 1,
    transform: 'none',
    transition: instant ? { duration: 0 } : { duration: seconds, delay },
    transitionEnd: { transform: 'none' },
  }),
};

// "still" is how the server rendered it, and stays that way unless it starts below the screen.
type Phase = 'still' | 'hidden' | 'revealing' | 'shown';

function RevealElement({
  as = 'div',
  seconds,
  groupTriggered,
  delay = 0,
  children,
  ...props
}: RevealProps & {
  seconds: number;
  // Set when a group from md decides when it shows; otherwise it waits for its own trigger.
  groupTriggered?: boolean;
  delay?: number;
}) {
  const Element = elements[as] as typeof m.div;
  const ref = useRef<HTMLDivElement>(null);
  const live = useLive();
  const wide = useWide();
  const [phase, setPhase] = useState<Phase>('still');
  const [instant, setInstant] = useState(false);
  const decided = useRef(false);

  // Hidden only if it is entirely below the screen once Motion is live, so nothing on screen flickers.
  useLayoutEffect(() => {
    if (!live || decided.current || !ref.current) return;
    decided.current = true;
    if (ref.current.getBoundingClientRect().top >= window.innerHeight) setPhase('hidden');
  }, [live]);

  const ownTrigger = groupTriggered === undefined;
  // Reduced motion switched on while it waits shows it at once.
  const waiting = phase === 'hidden' && live && !groupTriggered;
  const showNow = () => {
    setInstant(true);
    setPhase('revealing');
  };

  return (
    <Element
      ref={ref}
      {...props}
      // "hidden" until the reveal has finished, so tests never check half-transparent text.
      data-reveal={phase === 'hidden' || phase === 'revealing' ? 'hidden' : 'shown'}
      variants={revealVariants}
      custom={{ rise: wide, delay: ownTrigger ? 0 : delay, instant: instant || !live, seconds }}
      animate={phase === 'still' ? undefined : waiting ? 'hidden' : 'shown'}
      viewport={ownTrigger && waiting ? viewport : undefined}
      onViewportEnter={ownTrigger && waiting ? () => setPhase('revealing') : undefined}
      // Anything inside that takes focus while hidden shows at once.
      onFocus={waiting ? showNow : undefined}
      onAnimationComplete={(definition) => {
        if (definition === 'shown') setPhase('shown');
      }}
    >
      {children}
    </Element>
  );
}

// A section or block that fades in and rises 32px the first time it comes into view.
export function Reveal(props: RevealProps) {
  return <RevealElement {...props} seconds={duration.enter} />;
}

interface Group {
  stagger: boolean;
  triggered: boolean;
}

const GroupContext = createContext<Group | null>(null);

// A row of items, led by its heading, that reveal one after another (120ms apart) from md once 10% of
// the group is in view. Below md each item reveals on its own as it arrives.
export function RevealGroup({ as = 'div', children, ...props }: RevealProps) {
  const Element = elements[as] as typeof m.div;
  const live = useLive();
  const wide = useWide();
  const [triggered, setTriggered] = useState(false);
  const watch = live && wide && !triggered;
  return (
    <GroupContext.Provider value={{ stagger: wide, triggered }}>
      <Element
        {...props}
        viewport={watch ? viewport : undefined}
        onViewportEnter={watch ? () => setTriggered(true) : undefined}
      >
        {children}
      </Element>
    </GroupContext.Provider>
  );
}

// One item in a RevealGroup: index 0 is the heading, then each card in order. Outside a group it
// renders as a plain element.
export function RevealItem({ index = 0, ...props }: RevealProps & { index?: number }) {
  const group = useContext(GroupContext);
  if (!group) {
    const { as = 'div', children, ...rest } = props;
    const Element = elements[as] as typeof m.div;
    return <Element {...rest}>{children}</Element>;
  }
  return (
    <RevealElement
      {...props}
      seconds={duration.settle}
      groupTriggered={group.stagger ? group.triggered : undefined}
      delay={index * stagger}
    />
  );
}

const settleVariants: Variants = {
  hidden: { transform: 'scale(1.06)', transition: { duration: 0 } },
  shown: {
    transform: 'none',
    transition: { duration: duration.settle },
    transitionEnd: { transform: 'none' },
  },
};

// A photo settling into its frame as the reveal around it plays: scale 1.06 to 1, no fade. The frame
// clips it (overflow-hidden), so its corners stay put.
export function Settle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <m.div className={className} variants={settleVariants}>
      {children}
    </m.div>
  );
}
