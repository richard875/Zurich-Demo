// Error bodies share the { message } shape the BFF uses for validation errors,
// so the browser has one friendly-error format to read.
export function errorResponse(status: number, message: string): Response {
  return Response.json({ message }, { status });
}
