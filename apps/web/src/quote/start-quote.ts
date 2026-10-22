import { useNavigate } from '@modern-js/runtime/router';
import { presetIncomeProtection } from './journey-store';

export const QUOTE_START = '/quote?step=1';

// Starts a quote at step 1, keeping any About you answers, with income protection preset on or off
// for the cover step. Used by the quote chooser and the product cards.
export function useStartQuote() {
  const navigate = useNavigate();
  return async (incomeProtection: boolean) => {
    await presetIncomeProtection(incomeProtection);
    navigate(QUOTE_START);
  };
}
