// FIX: To resolve "Cannot redeclare block-scoped variable 'process'",
// we augment the existing global 'process.env' type instead of redeclaring 'process'.
// This is the standard way to add environment variable typings when using @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}
