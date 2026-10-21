import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { aboutYouSchema, ageOn, coverSchema, isRealDate, todayInSydney } from '../shared/quote';

describe('dates', () => {
  it('uses the calendar date in Sydney', () => {
    // 2pm UTC on 21 October is 1am on 22 October in Sydney.
    expect(todayInSydney(new Date('2026-10-21T14:00:00Z'))).toBe('2026-10-22');
  });

  it('counts a birthday only once it has arrived', () => {
    expect(ageOn('1990-10-22', '2026-10-21')).toBe(35);
    expect(ageOn('1990-10-22', '2026-10-22')).toBe(36);
  });

  it('rejects dates that do not exist', () => {
    expect(isRealDate('2024-02-29')).toBe(true);
    expect(isRealDate('2026-02-29')).toBe(false);
    expect(isRealDate('15/06/1990')).toBe(false);
  });
});

describe('aboutYouSchema', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-22T00:00:00+11:00'));
  });
  afterEach(() => vi.useRealTimers());

  const valid = { dateOfBirth: '1990-06-15', smoker: false, state: 'NSW' };
  const messageFor = (dateOfBirth: string) =>
    aboutYouSchema.safeParse({ ...valid, dateOfBirth }).error?.issues[0]?.message;

  it('accepts ages 18 to 60 on the quote date', () => {
    expect(aboutYouSchema.safeParse({ ...valid, dateOfBirth: '2008-10-22' }).success).toBe(true);
    expect(aboutYouSchema.safeParse({ ...valid, dateOfBirth: '1965-10-23' }).success).toBe(true);
  });

  it('rejects anyone under 18 or over 60', () => {
    expect(messageFor('2008-10-23')).toBe('You need to be aged 18 to 60 to get a quote');
    expect(messageFor('1965-10-22')).toBe('You need to be aged 18 to 60 to get a quote');
  });

  it('asks for a missing date, smoker answer and state', () => {
    const result = aboutYouSchema.safeParse({ dateOfBirth: '' });
    expect(result.error?.issues.map((issue) => issue.message)).toEqual([
      'Enter your date of birth',
      'Tell us whether you smoke',
      'Choose your state or territory',
    ]);
  });
});

describe('coverSchema', () => {
  it('accepts life cover alone or with income protection', () => {
    expect(coverSchema.safeParse({ lifeCover: 100_000, incomeProtection: null }).success).toBe(
      true,
    );
    expect(coverSchema.safeParse({ lifeCover: 2_000_000, incomeProtection: 10_000 }).success).toBe(
      true,
    );
  });

  it('rejects amounts outside the range or between steps', () => {
    expect(coverSchema.safeParse({ lifeCover: 2_050_000, incomeProtection: null }).success).toBe(
      false,
    );
    expect(coverSchema.safeParse({ lifeCover: 125_000, incomeProtection: null }).success).toBe(
      false,
    );
    expect(coverSchema.safeParse({ lifeCover: 500_000, incomeProtection: 750 }).success).toBe(
      false,
    );
  });
});
