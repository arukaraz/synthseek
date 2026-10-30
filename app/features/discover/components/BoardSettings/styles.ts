import { cva } from "class-variance-authority";

export const trayFrame = cva("overflow-hidden");

export const trayBody = cva(
  "border-fg/10 flex w-0 min-w-full flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b px-2 pt-1.5 pb-2.5"
);

export const trayChoice = cva("flex items-center gap-2");

export const trayLabel = cva("text-fg/60 font-mono text-[11px] font-medium tracking-[0.08em] uppercase");

export const templatesDialog = cva("sm:h-auto sm:max-h-[90vh] sm:max-w-2xl");

export const templatesHead = cva("flex flex-col gap-1 px-4 pt-4 pr-14 pb-3 sm:pt-6 sm:pr-16 sm:pl-6");

export const templatesHint = cva("flex");

export const templatesBody = cva("flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-6 sm:px-6");

export const settingsLink = cva(
  "text-primary-400 hover:text-primary-300 focus-visible:ring-primary-400 inline-flex shrink-0 items-center gap-1 rounded text-xs font-medium outline-none focus-visible:ring-2"
);

export const settingLabel = cva("text-fg text-sm font-medium");

export const settingHint = cva("text-fg/60 text-xs");

export const templateBlock = cva("border-fg/15 flex flex-col gap-3 rounded-xl border border-dashed p-3");

export const templateRow = cva("flex flex-wrap items-end gap-2");

export const templateNameField = cva("min-w-0 flex-1");

export const templateField = cva(
  "border-fg/15 bg-fg/5 text-fg focus:border-primary-500/50 focus:ring-primary-500/30 h-40 w-full resize-y rounded-lg border p-3 font-mono text-xs outline-none focus:ring-2"
);

export const templateActions = cva("flex flex-wrap justify-end gap-2");

export const hiddenInput = cva("sr-only");

export const reportList = cva("flex flex-col gap-1.5 text-xs");

export const reportLine = cva("flex gap-2 break-words", {
  variants: {
    tone: {
      info: "text-fg/80",
      warning: "text-warning-vivid",
      danger: "text-destructive-vivid",
    },
  },
});

export const reportBullet = cva("text-fg/40 shrink-0");
