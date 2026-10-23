import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useHydrated } from '@/lib/use-hydrated';

// Reveals run on CSS (the [data-reveal] rules in globals.css). This file only decides when: what
// starts below the screen waits, hidden, and plays once it comes into view.

interface RevealProps {
  // The element itself takes part, so a card in a grid gets no extra box around it.
  as?: 'div' | 'section' | 'article' | 'li';
  className?: string;
  id?: string;
  'aria-labelledby'?: string;
  children: ReactNode;
}

// One observer for every reveal, on zurich.com.au's trigger: 10% of it on screen, ignoring the bottom
// tenth of the screen. Each element is watched until it first comes into view. The area reaches far
// above the screen, so a block already scrolled past (on a slow phone, before it was watched, or in
// one jump) counts as reached too, rather than waiting until it's scrolled back to.
const onEnter = new WeakMap<Element, () => void>();
let observer: IntersectionObserver | undefined;

function watch(element: Element, callback: () => void) {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer?.unobserve(entry.target);
        onEnter.get(entry.target)?.();
      }
    },
    { threshold: 0.1, rootMargin: '100000px 0px -10% 0px' },
  );
  onEnter.set(element, callback);
  observer.observe(element);
  return () => {
    observer?.unobserve(element);
    onEnter.delete(element);
  };
}

function mediaQuery(query: string) {
  return {
    subscribe: (listener: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', listener);
      return () => list.removeEventListener('change', listener);
    },
    matches: () => window.matchMedia(query).matches,
  };
}

const reducedMotion = mediaQuery('(prefers-reduced-motion: reduce)');
// From md, groups stagger; below it each item reveals on its own as it arrives.
const wide = mediaQuery('(min-width: 48rem)');

// Both false on the server and during hydration.
function useReducedMotion(): boolean {
  return useSyncExternalStore(reducedMotion.subscribe, reducedMotion.matches, () => false);
}

function useWide(): boolean {
  return useSyncExternalStore(wide.subscribe, wide.matches, () => false);
}

// "still" is the server's HTML, and stays that way unless it starts below the screen.
type Phase = 'still' | 'hidden' | 'revealing' | 'shown';

function RevealElement({
  as = 'div',
  parts = false,
  item = false,
  groupTriggered,
  index,
  children,
  ...props
}: RevealProps & {
  parts?: boolean;
  item?: boolean;
  // Set when a group decides when it shows (from md); otherwise it waits for its own trigger.
  groupTriggered?: boolean;
  index?: number;
}) {
  // Typed as a div for the ref: every tag allowed here is a plain block element.
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>('still');
  const decided = useRef(false);

  // Nothing changes on the server, during hydration or with reduced motion. After hydration it is
  // hidden only if it is entirely below the screen, so nothing on screen ever flickers.
  useLayoutEffect(() => {
    if (!hydrated || reduce || decided.current || !ref.current) return;
    decided.current = true;
    if (ref.current.getBoundingClientRect().top >= window.innerHeight) setPhase('hidden');
  }, [hydrated, reduce]);

  const ownTrigger = groupTriggered === undefined;
  useEffect(() => {
    if (phase !== 'hidden' || !ownTrigger || !ref.current) return;
    return watch(ref.current, () => setPhase('revealing'));
  }, [phase, ownTrigger]);

  // Once its animations (its own and its parts') have finished, it counts as shown.
  const revealing = phase === 'revealing' || (phase === 'hidden' && groupTriggered === true);
  useEffect(() => {
    if (!revealing || !ref.current) return;
    let current = true;
    const running = ref.current
      .getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getTiming().iterations !== Infinity);
    void Promise.all(running.map((animation) => animation.finished.catch(() => undefined))).then(
      () => current && setPhase('shown'),
    );
    return () => {
      current = false;
    };
  }, [revealing]);

  return (
    <Tag
      ref={ref}
      {...props}
      // "hidden" until the reveal has finished, so tests never check half-transparent text.
      data-reveal={phase === 'hidden' || phase === 'revealing' ? 'hidden' : 'shown'}
      data-revealing={revealing ? '' : undefined}
      data-reveal-parts={parts ? '' : undefined}
      data-reveal-item={item ? '' : undefined}
      style={
        revealing && !ownTrigger && index
          ? ({ '--reveal-index': index } as CSSProperties)
          : undefined
      }
      // Anything inside that takes keyboard focus while it waits or reveals shows at once, so focus never
      // rests on something faint or moving. Focus from a click (not :focus-visible) leaves it be, so
      // nothing jumps from under the pointer between press and release.
      onFocus={
        phase === 'hidden' || phase === 'revealing'
          ? (event) => {
              if (event.target.matches(':focus-visible')) setPhase('shown');
            }
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

// A section or block that fades in and rises 32px over 500ms the first time it comes into view (on
// phones it fades in place). With `parts`, only its [data-reveal-part] children fade and rise, so a
// coloured band can stay put while its text comes in.
export function Reveal(props: RevealProps & { parts?: boolean }) {
  return <RevealElement {...props} />;
}

interface Group {
  stagger: boolean;
  triggered: boolean;
}

const GroupContext = createContext<Group | null>(null);

// A heading and a row of items that reveal one after another, 120ms apart, once 10% of the group is
// in view (from md). Below md each item reveals on its own as it arrives. The group itself never
// fades, so its background stays put.
export function RevealGroup({ as = 'div', children, ...props }: RevealProps) {
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const wide = useWide();
  const [triggered, setTriggered] = useState(false);

  useEffect(() => {
    if (!hydrated || reduce || !wide || triggered || !ref.current) return;
    return watch(ref.current, () => setTriggered(true));
  }, [hydrated, reduce, wide, triggered]);

  return (
    <GroupContext.Provider value={{ stagger: wide, triggered }}>
      <Tag ref={ref} {...props}>
        {children}
      </Tag>
    </GroupContext.Provider>
  );
}

// One item in a RevealGroup, over 600ms: index 0 is the heading, then each card in order. Outside a
// group it renders as a plain element.
export function RevealItem({ index = 0, ...props }: RevealProps & { index?: number }) {
  const group = useContext(GroupContext);
  if (!group) {
    const { as: Tag = 'div', children, ...rest } = props;
    return <Tag {...rest}>{children}</Tag>;
  }
  return (
    <RevealElement
      {...props}
      item
      index={index}
      groupTriggered={group.stagger ? group.triggered : undefined}
    />
  );
}

// A photo settling into its frame as the reveal around it plays: scale 1.06 to 1, no fade. The frame
// clips it (overflow-hidden), so its corners stay put.
export function Settle({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div data-settle="" className={className}>
      {children}
    </div>
  );
}
