import type { UnderwritingRequest, UnderwritingResponse } from '../_lib/mulesoft-contract';

// Any "yes" to a health question sends the application to a person to review.
export function underwrite(request: UnderwritingRequest): UnderwritingResponse {
  return { decision: request.answers.some(({ answer }) => answer) ? 'REFER' : 'ACCEPT' };
}
