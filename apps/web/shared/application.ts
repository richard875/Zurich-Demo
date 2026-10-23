// Application and policy rules shared by the /apply form and the BFF.
import { z } from 'zod';

export const HEALTH_QUESTIONS = [
  {
    id: 'heartCancerStroke',
    text: 'In the last 5 years, have you been treated for heart disease, cancer or a stroke?',
  },
  {
    id: 'undiagnosedSymptoms',
    text: "Do you have any symptoms you haven't seen a doctor about yet?",
  },
  {
    id: 'hazardousWork',
    text: 'Does your work involve heights over 15 metres, explosives or working offshore?',
  },
  {
    id: 'overseasStay',
    text: 'Do you plan to live or work outside Australia for more than 3 months?',
  },
] as const;

export type HealthQuestionId = (typeof HEALTH_QUESTIONS)[number]['id'];

const answer = z.boolean({
  required_error: 'Answer yes or no',
  invalid_type_error: 'Answer yes or no',
});

export const healthAnswersSchema = z.object({
  heartCancerStroke: answer,
  undiagnosedSymptoms: answer,
  hazardousWork: answer,
  overseasStay: answer,
}) satisfies z.ZodType<Record<HealthQuestionId, boolean>>;

// The demo takes no names: the form shows a made-up one (src/apply/demo-names.ts) that it never sends.
export const applicationFormSchema = z.object({
  answers: healthAnswersSchema,
  declaration: z.literal(true, {
    errorMap: () => ({ message: 'Tick the box to confirm your answers' }),
  }),
});

// Strict, so a request carrying anything more, such as a first name, is turned away with a 400
// rather than quietly trimmed.
export const applicationRequestSchema = z
  .object({
    quoteId: z.string().uuid(),
    answers: healthAnswersSchema,
  })
  .strict();

export const applicationResultSchema = z.object({
  applicationId: z.string().uuid(),
  status: z.enum(['PROCESSING', 'REFERRED']),
});

export const policySchema = z.object({
  applicationId: z.string().uuid(),
  createdAt: z.string().datetime(),
  status: z.enum(['PROCESSING', 'ACTIVE', 'REFERRED']),
  policyNumber: z.string().nullable(),
  lifeCover: z.number().int(),
  incomeProtection: z.number().int().nullable(),
  monthlyPremiumCents: z.number().int(),
});

export const policiesSchema = z.object({ policies: z.array(policySchema) });

export type ApplicationForm = z.infer<typeof applicationFormSchema>;
export type ApplicationRequest = z.infer<typeof applicationRequestSchema>;
export type ApplicationResult = z.infer<typeof applicationResultSchema>;
export type Policy = z.infer<typeof policySchema>;
