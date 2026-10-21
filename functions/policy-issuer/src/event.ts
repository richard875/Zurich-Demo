import { z } from 'zod';

// Published by the BFF when underwriting accepts an application. Validated on both ends.
export const applicationSubmittedSchema = z.object({
  type: z.literal('ApplicationSubmitted'),
  customerId: z.string().regex(/^cust_[0-9a-f]{16}$/),
  sk: z.string().startsWith('APP#'),
  applicationId: z.string().uuid(),
  correlationId: z.string().min(1),
});

export type ApplicationSubmitted = z.infer<typeof applicationSubmittedSchema>;
