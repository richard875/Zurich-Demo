const dollarsAndCents = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD' });
const wholeDollars = new Intl.NumberFormat('en-AU', {
  style: 'currency',
  currency: 'AUD',
  maximumFractionDigits: 0,
});

export const formatCents = (cents: number) => dollarsAndCents.format(cents / 100);
export const formatWholeDollars = (dollars: number) => wholeDollars.format(dollars);
