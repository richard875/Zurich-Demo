// Modern.js's tsconfig uses "node" module resolution, which ignores package "exports", so TypeScript
// can't find cn/config's types on its own. The bundler and Vitest resolve the module itself as usual.
declare module 'cn/config' {
  export * from 'cn/dist/config';
}
