import { cva } from "class-variance-authority";

export const brandedLoaderRoot = cva(
  "auth-stage fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 overflow-hidden"
);

export const brandedLoaderGrid = cva("pointer-events-none absolute inset-0 auth-grid");

export const brandedLoaderOrb = cva(
  "auth-orb pointer-events-none absolute top-1/2 left-1/2 h-[20rem] w-[20rem] rounded-full sm:h-[35rem] sm:w-[35rem]"
);

export const brandedLoaderMark = cva("relative z-10 flex h-24 w-24 items-center justify-center sm:h-28 sm:w-28");

export const brandedLoaderLabel = cva(
  "relative z-10 text-fg-muted text-[0.6875rem] font-bold uppercase tracking-[0.18em]"
);
