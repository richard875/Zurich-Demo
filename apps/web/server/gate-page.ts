// The gate page (server/site-gate.ts): one self-contained HTML document, with no script and
// nothing from /static, which stays closed until the visitor is in. It follows the flow pages (a
// Zurich Blue band with its shapes, then a white card) in the app's own fonts, colours and
// controls, but carries no logo and no Zurich favicon: the app's layout sets that once they're in.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// The built server is CommonJS and has require; the dev server loads these files as ES modules,
// from the app's own folder.
const resolve =
  typeof require === 'function' ? require : createRequire(join(process.cwd(), 'x.js'));
const tokens = (file: string) =>
  readFileSync(resolve.resolve(`@zurich/design-tokens/${file}`), 'utf8');

// Only the faces the page uses: Zurich Sans light (the headline), regular and medium, and Ogg for
// the headline's emphasised word. About 140 KB, inlined because /static is closed.
function fontFaces(): string {
  const wanted = [
    /font-family:ZurichSans;[^}]*font-weight:(300|400|500);font-style:normal;/,
    /font-family:Ogg;[^}]*font-weight:400;font-style:normal;/,
  ];
  const faces = tokens('EmbeddedFonts.css').match(/@font-face\{[^}]*\}/g) ?? [];
  return faces.filter((face) => wanted.some((pattern) => pattern.test(face))).join('');
}

// An icon's SVG, as the design tokens' icon sets give it to [icon] elements.
function icon(name: string): string {
  const match = tokens('icons/line.css').match(
    new RegExp(`\\[icon\\^="${name}:line"\\]\\{--zi: ?url\\("([^"]+)"\\)`),
  );
  if (!match?.[1]) throw new Error(`The design tokens have no ${name}:line icon`);
  return match[1];
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char] ?? '',
  );

// The lock doubles as the favicon. Built once, on first use.
function buildAssets() {
  const lock = icon('lock-closed');
  const styles = `${fontFaces()}
:root {
  --zurich-blue: #2167ae; --dark-blue: #23366f; --mid-blue: #5495cf; --light-blue: #91bfe3;
  --sky-blue: #1fb1e6; --dove: #dde4e3; --zurich-white: #eceeef; --peach: #fd7c6d;
  --muted-foreground: color-mix(in srgb, var(--dark-blue) 80%, white);
  --ease-stage: cubic-bezier(0.22, 1, 0.36, 1); --motion-state: 200ms;
  --icon-lock: url("${lock}"); --icon-alert: url("${icon('alert-circle')}");
  --icon-arrow: url("${icon('arrow-right')}");
}
*, *::before, *::after { box-sizing: border-box; margin: 0; }
html {
  background: #fff; color: var(--dark-blue); font-family: ZurichSans, system-ui, sans-serif;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; line-height: 1.5;
}
body { min-height: 100vh; display: flex; flex-direction: column; }
:focus-visible { outline: 3px solid var(--dark-blue); outline-offset: 2px; }
.container { width: 100%; max-width: 75rem; margin: 0 auto; padding: 0 1rem; }
.band { background: var(--zurich-blue); color: #fff; overflow: hidden; }
.band .container { display: flex; flex-direction: column; }
.band-text { max-width: 45rem; padding-top: 2.5rem; }
h1 { font-size: 2.25rem; line-height: 1.16; font-weight: 300; }
h1 em { font-family: Ogg, Georgia, serif; font-style: normal; font-weight: 400; }
.band p { margin-top: 1rem; font-size: 1.25rem; line-height: 1.875rem; }
.shapes { margin: 2rem -1rem 0 0; height: 4rem; aspect-ratio: 267 / 144; align-self: flex-end; }
.shapes svg { display: block; width: 100%; height: 100%; }
main { flex: 1; padding: 2.5rem 0; }
.card {
  display: grid; gap: 1.5rem; max-width: 30rem; padding: 1.5rem; border-radius: 1rem;
  background: #fff; box-shadow: 0 0 0 1px var(--dove);
}
.icon-circle {
  display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem;
  border-radius: 9999px; background: var(--zurich-blue); color: #fff; font-size: 1.5rem;
}
.icon {
  display: inline-block; flex-shrink: 0; width: 1em; height: 1em; background-color: currentColor;
  mask: var(--icon) no-repeat center / 1em;
}
.card h2 { font-size: 1.25rem; line-height: 1.875rem; font-weight: 500; }
.card .lede { margin-top: 0.5rem; color: var(--muted-foreground); }
.field { display: grid; gap: 0.5rem; }
label { font-size: 1rem; line-height: 1.375; font-weight: 500; }
input {
  width: 100%; height: 3rem; padding: 0 1rem; border: 1px solid var(--mid-blue);
  border-radius: 0.75rem; background: #fff; color: inherit; font: inherit; font-size: 1rem;
  transition: border-color var(--motion-state) ease-in-out;
}
input:hover { border-color: var(--zurich-blue); }
input[aria-invalid='true'] { border-color: var(--peach); box-shadow: 0 0 0 2px var(--peach); }
.error { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; font-weight: 500; }
.error .icon { color: var(--peach); font-size: 1.125rem; }
button {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem;
  justify-self: start; height: 2.75rem; padding: 0 1.5rem; border: 2px solid transparent;
  border-radius: 9999px; background: var(--zurich-blue); color: #fff; font: inherit;
  font-size: 1.125rem; cursor: pointer; box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  transition: background-color var(--motion-state) ease-in-out,
    box-shadow var(--motion-state) ease-in-out, scale 100ms ease-in-out;
}
button:hover {
  background: var(--dark-blue);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
}
button .icon { font-size: 1.25em; transition: translate var(--motion-state) ease-in-out; }
@media (min-width: 40rem) {
  .container { padding: 0 1.5rem; }
  .shapes { margin-right: -1.5rem; }
}
@media (min-width: 48rem) {
  .band .container { flex-direction: row; align-items: flex-end; justify-content: space-between; gap: 4rem; }
  .band-text { padding: 4rem 0; }
  h1 { font-size: 3rem; }
  .shapes { margin: 0; height: 6rem; }
  main { padding: 4rem 0; }
  .card { padding: 2.5rem; }
}
@keyframes stage-rise { from { opacity: var(--stage-opacity, 0); transform: translateY(32px); } }
@keyframes shape-slide-in { from { opacity: 0; transform: translateX(-72px); } }
/* The stage entrance plays on arrival, not again after a wrong password. */
@media (prefers-reduced-motion: no-preference) {
  body:not([data-retry]) .band-text > * { animation: stage-rise 500ms var(--ease-stage) 0.2s both; }
  body:not([data-retry]) .band-text > h1 { --stage-opacity: 0.1; }
  body:not([data-retry]) .shapes { animation: shape-slide-in 0.5s var(--ease-stage) 0.1s both; }
  button:active { scale: 0.98; }
}
@media (hover: hover) and (prefers-reduced-motion: no-preference) {
  button:hover .icon { translate: 4px 0; }
}`;
  return { styles, favicon: lock };
}

let built: ReturnType<typeof buildAssets> | undefined;
const assets = () => (built ??= buildAssets());

// zurich.com.au's stage shapes, as the flow pages' band has them (src/components/shapes.tsx).
const shapes = `<div class="shapes" aria-hidden="true"><svg viewBox="0 0 267 144">
<path fill="#eceeef" d="M122.441 24.649C130.253 16.8353 139.528 10.6369 149.736 6.40759C159.944 2.17831 170.884 0.00100644 181.934 3.48832e-07C192.983 -0.00100574 203.924 2.1743 214.133 6.40172C224.341 10.6291 233.617 16.8259 241.431 24.6382C249.244 32.4505 255.443 41.7253 259.672 51.933C263.902 62.1408 266.079 73.0816 266.08 84.1309C266.081 95.1801 263.905 106.121 259.678 116.33C255.451 126.538 249.254 135.814 241.442 143.628L122.441 24.649Z"/>
<path fill="#91bfe3" d="M47.7567 143.94C42.3226 138.486 38.016 132.015 35.0827 124.897C32.1495 117.778 30.6471 110.152 30.6612 102.452C30.6754 94.7532 32.2059 87.1323 35.1653 80.0246C38.1247 72.917 42.4552 66.4618 47.9093 61.0277C53.3634 55.5936 59.8345 51.287 66.953 48.3538C74.0715 45.4205 81.698 43.9181 89.3972 43.9323C97.0963 43.9465 104.717 45.477 111.825 48.4364C118.933 51.3958 125.388 55.7262 130.822 61.1804L47.7567 143.94Z"/>
<circle cx="145.046" cy="103.729" r="40.2712" fill="#ffffff"/>
<circle cx="17.4915" cy="126.508" r="17.4915" fill="#1fb1e6"/>
</svg></div>`;

export function gatePage({
  action,
  next,
  error,
}: {
  action: string;
  next: string;
  error?: string;
}): string {
  const { styles, favicon } = assets();
  const errorId = 'password-error';
  return `<!doctype html>
<html lang="en-AU">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="robots" content="noindex,nofollow">
<title>Private demo</title>
<link rel="icon" type="image/svg+xml" href="${escapeHtml(favicon)}">
<style>${styles}</style>
</head>
<body${error ? ' data-retry' : ''}>
<div class="band">
<div class="container">
<div class="band-text">
<h1>This demo is <em>private</em></h1>
<p>Enter the password you were given to take a look around.</p>
</div>
${shapes}
</div>
</div>
<main>
<div class="container">
<form class="card" method="post" action="${escapeHtml(action)}">
<span class="icon-circle"><i class="icon" style="--icon: var(--icon-lock)" aria-hidden="true"></i></span>
<div>
<h2>Password required</h2>
<p class="lede">You'll stay signed in on this browser for 30 days.</p>
</div>
<div class="field">
<label for="password">Password</label>
<input id="password" name="password" type="password" autocomplete="current-password" required autofocus${
    error ? ` aria-invalid="true" aria-describedby="${errorId}"` : ''
  }>
${
  error
    ? `<p id="${errorId}" class="error" role="alert"><i class="icon" style="--icon: var(--icon-alert)" aria-hidden="true"></i>${escapeHtml(error)}</p>`
    : ''
}
</div>
<input type="hidden" name="next" value="${escapeHtml(next)}">
<button type="submit">Continue<i class="icon" style="--icon: var(--icon-arrow)" aria-hidden="true"></i></button>
</form>
</div>
</main>
</body>
</html>`;
}
