import { cva } from "class-variance-authority";

export const authLayoutRoot = cva(
  "bg-surface relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4"
);

export const authLayoutBackdrop = cva(
  "from-primary-500/20 via-accent-500/10 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent"
);
