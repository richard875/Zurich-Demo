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
// starts below the screen waits, hidden, and plays once it comes into view; an entrance that arrives
// on screen with content that has just loaded plays as it arrives.

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

// "still" is the server's HTML, and stays that way unless it starts below the screen. "unseen" is not
// shown yet (below lg the flow pages' side card waits, invisible, for the page's content). "entering"
// is revealing as it arrives, in line with the others.
type Phase = 'still' | 'unseen' | 'hidden' | 'entering' | 'revealing' | 'shown';

// An entrance waits at most three places behind the first, so the last is done inside a second.
const MAX_PLACE = 3;

function RevealElement({
  as = 'div',
  parts = false,
  item = false,
  groupTriggered,
  index,
  entrance,
  children,
  ...props
}: RevealProps & {
  parts?: boolean;
  item?: boolean;
  // Set when a group decides when it shows (from md); otherwise it waits for its own trigger.
  groupTriggered?: boolean;
  index?: number;
  // Its place in line when it arrives on screen with content that has just loaded.
  entrance?: number;
}) {
  // Typed as a div for the ref: every tag allowed here is a plain block element.
  const Tag = as as 'div';
  const ref = useRef<HTMLDivElement>(null);
  const hydrated = useHydrated();
  const reduce = useReducedMotion();
  const wide = useWide();
  const [phase, setPhase] = useState<Phase>('still');
  const decided = useRef(false);
  // An entrance mounted after hydration is content the server never rendered: nobody has seen it yet.
  const arrives = useRef(entrance !== undefined && hydrated);

  // Nothing changes on the server, during hydration or with reduced motion. After hydration it is
  // hidden only if it is entirely below the screen, so nothing on screen ever flickers. An entrance
  // that arrives on screen plays at once, before its first paint.
  useLayoutEffect(() => {
    if (!hydrated || reduce || decided.current || !ref.current) return;
    decided.current = true;
    if (getComputedStyle(ref.current).visibility === 'hidden') setPhase('unseen');
    else if (ref.current.getBoundingClientRect().top >= window.innerHeight) setPhase('hidden');
    else if (arrives.current) setPhase('entering');
  }, [hydrated, reduce]);

  // Something unseen arrives once it's shown, when what it waits for has loaded: it plays at once if
  // it's on screen, or waits to be scrolled to. Until then it stays transparent, so it never flashes.
  // Whatever played inside it meanwhile (an entrance on load) went unseen, so it ends there, rather
  // than running on under the reveal.
  useEffect(() => {
    if (phase !== 'unseen' || !ref.current) return;
    const element = ref.current;
    let arrived = false;
    const arrive = () => {
      if (arrived || getComputedStyle(element).visibility === 'hidden') return;
      arrived = true;
      observer.disconnect();
      for (const animation of element.getAnimations({ subtree: true })) {
        if (animation.effect?.getTiming().iterations !== Infinity) animation.finish();
      }
      setPhase(element.getBoundingClientRect().top >= window.innerHeight ? 'hidden' : 'entering');
    };
    const observer = new MutationObserver(arrive);
    observer.observe(document.body, { childList: true, subtree: true });
    // It may be shown already, if what it waited for arrived while this was being set up.
    const frame = requestAnimationFrame(arrive);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [phase]);

  const ownTrigger = groupTriggered === undefined;
  useEffect(() => {
    if (phase !== 'hidden' || !ownTrigger || !ref.current) return;
    return watch(ref.current, () => setPhase('revealing'));
  }, [phase, ownTrigger]);

  const waiting = phase === 'unseen' || phase === 'hidden';
  // Once its animations (its own and its parts') have finished, it counts as shown.
  const revealing =
    phase === 'entering' ||
    phase === 'revealing' ||
    (phase === 'hidden' && groupTriggered === true);
  // A group's item waits its index; an entrance waits its place in line, from md.
  const stagger = ownTrigger
    ? phase === 'entering' && wide
      ? Math.min(entrance ?? 0, MAX_PLACE)
      : 0
    : index;
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
      data-reveal={waiting || revealing ? 'hidden' : 'shown'}
      data-revealing={revealing ? '' : undefined}
      data-reveal-parts={parts ? '' : undefined}
      data-reveal-item={item ? '' : undefined}
      style={revealing && stagger ? ({ '--reveal-index': stagger } as CSSProperties) : undefined}
      // Anything inside that takes keyboard focus while it waits or reveals shows at once, so focus never
      // rests on something faint or moving. Focus from a click (not :focus-visible) leaves it be, so
      // nothing jumps from under the pointer between press and release.
      onFocus={
        waiting || revealing
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
// coloured band can stay put while its text comes in. With `entrance`, a block that arrives on screen
// with content that has just loaded (a list of cards) plays as it arrives, instead of just being
// there: `entrance` is its place in line, 120ms apart from md.
export function Reveal(props: RevealProps & { parts?: boolean; entrance?: number }) {
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
