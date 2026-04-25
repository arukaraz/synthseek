import { cva } from "class-variance-authority";

export const authLayoutRoot = cva(
  "bg-surface relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-4"
);

export const authLayoutBackdrop = cva(
  "from-primary-500/20 via-accent-500/10 pointer-events-none absolute inset-0 bg-gradient-to-br to-transparent"
);

export const authCard = cva(
  "bg-surface/70 border-fg/10 flex flex-col gap-6 rounded-2xl border p-8 shadow-2xl backdrop-blur-xl"
);

export const authInput = cva(
  "border-fg/15 bg-fg/5 focus:border-primary-500/50 focus:ring-primary-500/30 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
);
