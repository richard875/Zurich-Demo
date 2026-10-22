import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AboutYou, Cover, Quote } from '@shared/quote';

interface QuoteJourney {
  aboutYou: AboutYou | null;
  cover: Cover | null;
  quote: Quote | null;
  // Chosen in the quote chooser or on a product card: whether the cover step starts with income
  // protection on. Null once the customer has chosen on the cover step itself.
  incomeProtectionPreset: boolean | null;
  saveAboutYou: (aboutYou: AboutYou) => void;
  saveQuote: (cover: Cover, quote: Quote) => void;
  reset: () => void;
}

export const useQuoteJourney = create<QuoteJourney>()(
  persist(
    (set) => ({
      aboutYou: null,
      cover: null,
      quote: null,
      incomeProtectionPreset: null,
      // New answers make any earlier price stale.
      saveAboutYou: (aboutYou) => set({ aboutYou, quote: null }),
      saveQuote: (cover, quote) => set({ cover, quote, incomeProtectionPreset: null }),
      // Once an application is in, its quote is used up.
      reset: () => set({ aboutYou: null, cover: null, quote: null, incomeProtectionPreset: null }),
    }),
    {
      name: 'zld-quote',
      storage: createJSONStorage(() => sessionStorage),
      partialize: ({ aboutYou, cover, quote, incomeProtectionPreset }) => ({
        aboutYou,
        cover,
        quote,
        incomeProtectionPreset,
      }),
      // The server can't read sessionStorage, so the browser loads it after hydration.
      skipHydration: true,
    },
  ),
);

// Marketing pages don't load the saved journey, and writing before it loads would overwrite the
// customer's About you answers in sessionStorage. So load first, then set the preset.
export async function presetIncomeProtection(on: boolean): Promise<void> {
  if (!useQuoteJourney.persist.hasHydrated()) await useQuoteJourney.persist.rehydrate();
  useQuoteJourney.setState({ incomeProtectionPreset: on });
}

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
