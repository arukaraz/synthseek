import { cva } from "class-variance-authority";

export const consentFrame = cva("flex min-h-dvh items-center justify-center p-4");

export const consentColumn = cva("flex w-full max-w-md flex-col items-center gap-6");

export const consentCard = cva("border-fg/10 bg-surface/60 w-full rounded-2xl border p-6 shadow-xl");

export const consentActions = cva("mt-6 flex justify-end gap-2");
