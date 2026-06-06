import { cva } from "class-variance-authority";

export const recoveryStage = cva(
  "auth-stage fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4"
);

export const recoveryGrid = cva("auth-grid pointer-events-none absolute inset-0");

export const recoveryOrb = cva(
  "auth-orb pointer-events-none absolute top-1/2 left-1/2 h-[20rem] w-[20rem] rounded-full sm:h-[35rem] sm:w-[35rem]"
);

export const recoveryCard = cva(
  "auth-card relative z-10 flex w-full max-w-[27rem] flex-col items-center gap-4 rounded-3xl border border-fg/[0.09] p-6 text-center sm:p-9 sm:backdrop-blur-[18px]"
);

export const recoveryEyebrow = cva("text-fg-muted text-[0.6875rem] font-bold uppercase tracking-[0.18em]");

export const recoveryTitle = cva("text-fg text-lg font-semibold");

export const recoveryMessage = cva("text-fg-muted text-sm leading-relaxed");

export const recoveryStatusRow = cva("text-fg-muted flex items-center justify-center gap-2 text-sm");
