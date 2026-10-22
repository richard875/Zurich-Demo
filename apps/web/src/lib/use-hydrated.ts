import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// False while React hydrates the server's HTML, true after. A page whose content hydrates after the
// header can find the session already fetched; until then it shows what the server rendered, so the
// two match.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
