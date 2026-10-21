import { z } from 'zod';

export const signInSchema = z.object({
  visitorId: z.string().regex(/^[A-Za-z0-9]{8,64}$/, 'Invalid visitor ID'),
});

export const sessionSchema = z.discriminatedUnion('signedIn', [
  z.object({ signedIn: z.literal(true), customerId: z.string(), deviceLabel: z.string() }),
  z.object({ signedIn: z.literal(false) }),
]);

export type Session = z.infer<typeof sessionSchema>;
