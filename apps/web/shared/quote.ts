// Quote rules shared by the browser forms and the BFF, so both validate the same way.
import { z } from 'zod';
import { formatWholeDollars } from './money';

export const STATES = ['ACT', 'NSW', 'NT', 'QLD', 'SA', 'TAS', 'VIC', 'WA'] as const;
export type State = (typeof STATES)[number];

export const STATE_NAMES: Record<State, string> = {
  ACT: 'Australian Capital Territory',
  NSW: 'New South Wales',
  NT: 'Northern Territory',
  QLD: 'Queensland',
  SA: 'South Australia',
  TAS: 'Tasmania',
  VIC: 'Victoria',
  WA: 'Western Australia',
};

export const MIN_AGE = 18;
export const MAX_AGE = 60;
export const LIFE_COVER = { min: 100_000, max: 2_000_000, step: 50_000 } as const;
export const INCOME_PROTECTION = { min: 1_000, max: 10_000, step: 500 } as const;

const isoDate = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isRealDate(value: string): boolean {
  const match = isoDate.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

// Quotes are priced on Sydney's calendar date, whatever time zone the server runs in.
export function todayInSydney(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

// Both dates are YYYY-MM-DD strings.
export function ageOn(dateOfBirth: string, onDate: string): number {
  const [birthYear, birthMonth, birthDay] = dateOfBirth.split('-').map(Number);
  const [year, month, day] = onDate.split('-').map(Number);
  const hadBirthday = month > birthMonth || (month === birthMonth && day >= birthDay);
  return year - birthYear - (hadBirthday ? 0 : 1);
}

function coverAmount(range: { min: number; max: number; step: number }, label: string) {
  const message = `Choose ${label} from ${formatWholeDollars(range.min)} to ${formatWholeDollars(range.max)}`;
  return z
    .number({ invalid_type_error: message })
    .int(message)
    .min(range.min, message)
    .max(range.max, message)
    .refine(
      (value) => value % range.step === 0,
      `Choose ${label} in ${formatWholeDollars(range.step)} steps`,
    );
}

export const aboutYouSchema = z.object({
  dateOfBirth: z.string().superRefine((value, ctx) => {
    if (!isRealDate(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: value ? 'Enter a real date of birth' : 'Enter your date of birth',
      });
      return;
    }
    const age = ageOn(value, todayInSydney());
    if (age < MIN_AGE || age > MAX_AGE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `You need to be aged ${MIN_AGE} to ${MAX_AGE} to get a quote`,
      });
    }
  }),
  smoker: z.boolean({
    required_error: 'Tell us whether you smoke',
    invalid_type_error: 'Tell us whether you smoke',
  }),
  state: z.enum(STATES, { errorMap: () => ({ message: 'Choose your state or territory' }) }),
});

export const coverSchema = z.object({
  lifeCover: coverAmount(LIFE_COVER, 'life cover'),
  incomeProtection: coverAmount(INCOME_PROTECTION, 'a monthly benefit').nullable(),
});

export const quoteRequestSchema = aboutYouSchema.merge(coverSchema);

export type AboutYou = z.infer<typeof aboutYouSchema>;
export type Cover = z.infer<typeof coverSchema>;
export type QuoteRequest = z.infer<typeof quoteRequestSchema>;

const cents = z.number().int().nonnegative();

export const quoteSchema = z.object({
  quoteId: z.string().uuid(),
  createdAt: z.string().datetime(),
  age: z.number().int(),
  smoker: z.boolean(),
  state: z.enum(STATES),
  life: z.object({ sumInsured: z.number().int(), monthlyPremiumCents: cents }),
  incomeProtection: z
    .object({ monthlyBenefit: z.number().int(), monthlyPremiumCents: cents, discountCents: cents })
    .nullable(),
  monthlyPremiumCents: cents,
  yearlyPremiumCents: cents,
});

export type Quote = z.infer<typeof quoteSchema>;

export const apiErrorSchema = z.object({ message: z.string() });
