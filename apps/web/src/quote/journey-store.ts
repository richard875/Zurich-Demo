import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AboutYou, Cover, Quote } from '@shared/quote';

interface QuoteJourney {
  aboutYou: AboutYou | null;
  cover: Cover | null;
  quote: Quote | null;
  saveAboutYou: (aboutYou: AboutYou) => void;
  saveQuote: (cover: Cover, quote: Quote) => void;
}

export const useQuoteJourney = create<QuoteJourney>()(
  persist(
    (set) => ({
      aboutYou: null,
      cover: null,
      quote: null,
      // New answers make any earlier price stale.
      saveAboutYou: (aboutYou) => set({ aboutYou, quote: null }),
      saveQuote: (cover, quote) => set({ cover, quote }),
    }),
    {
      name: 'zld-quote',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ aboutYou, cover, quote }) => ({ aboutYou, cover, quote }),
      // The server can't read sessionStorage, so the browser loads it after hydration.
      skipHydration: true,
    },
  ),
);

// Without sessionStorage (on the server) zustand doesn't attach `persist`, so only the browser checks it.
export function useJourneyLoaded(): boolean {
  const [loaded, setLoaded] = useState(
    () => typeof window !== 'undefined' && useQuoteJourney.persist.hasHydrated(),
  );
  useEffect(() => {
    if (loaded) return;
    const unsubscribe = useQuoteJourney.persist.onFinishHydration(() => setLoaded(true));
    void useQuoteJourney.persist.rehydrate();
    return unsubscribe;
  }, [loaded]);
  return loaded;
}
