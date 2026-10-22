// Modern.js's generated browser entry, with one change. Its streaming server renders the app as the
// first of two siblings (it appends a shell marker), and React's useId counts sibling slots. Without a
// matching empty slot here, every useId differs between server and browser, so Radix's aria-controls
// and aria-labelledby point at ids that don't exist once a sheet, menu or accordion opens.
import { render } from '@modern-js/runtime/browser';
import { createRoot } from '@modern-js/runtime/react';

const ModernRoot = createRoot();

void render(<>{[<ModernRoot key="root" />, null]}</>, 'root');
