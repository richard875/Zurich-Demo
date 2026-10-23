import { useState, type ReactNode } from 'react';

// Whether a loading panel showed when the component mounted: content that replaces one fades in
// (Loaded below); content that was ready from the start, as on a later visit, just appears.
export function useWasLoading(loading: boolean): boolean {
  const [wasLoading] = useState(loading);
  return wasLoading;
}

// Content that has just replaced a loading panel fades in over 200ms (150ms with reduced motion).
export function Loaded({ fade, children }: { fade: boolean; children: ReactNode }) {
  return (
    <div
      className={
        fade
          ? 'animate-in fade-in duration-(--motion-state) ease-entrance motion-reduce:duration-(--motion-switch-out)'
          : undefined
      }
    >
      {children}
    </div>
  );
}
