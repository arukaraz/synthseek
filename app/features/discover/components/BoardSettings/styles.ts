import { cva } from "class-variance-authority";

export const settingsGrid = cva("grid items-start gap-4 pt-4 lg:grid-cols-2");

export const settingsSection = cva("border-fg/10 bg-fg/[0.02] flex min-w-0 flex-col gap-4 rounded-2xl border p-4");

export const settingsTitle = cva("text-fg/60 font-mono text-[11px] font-medium tracking-[0.14em] uppercase");

export const settingRow = cva("flex flex-col gap-2");

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
