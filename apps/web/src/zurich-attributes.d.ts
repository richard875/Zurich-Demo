import 'react';

// Attributes the Zurich design-system CSS selects on: <i z-icon icon="…"> and <div z-logo inline>.
declare module 'react' {
  // Merging needs React's own type parameter name, even though it isn't used here.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface HTMLAttributes<T> {
    icon?: string;
    inline?: string;
  }
}
