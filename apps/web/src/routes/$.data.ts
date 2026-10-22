// Answers unknown addresses with a 404 status, as Modern.js's own fallback page does.
export const loader = () => new Response('404', { status: 404 });
