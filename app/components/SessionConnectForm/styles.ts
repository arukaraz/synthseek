import { cva } from "class-variance-authority";

export const sessionForm = cva("flex w-full max-w-lg flex-col gap-3 text-left");

export const sessionCopy = cva("text-fg/70 text-xs leading-relaxed");

export const sessionField = cva(
  "border-fg/15 bg-fg/5 text-fg placeholder:text-fg/30 focus:border-primary-500/50 focus:ring-primary-500/30 h-32 w-full resize-y rounded-lg border p-3 font-mono text-xs outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60"
);

export const sessionActions = cva("flex flex-wrap items-center gap-2");
