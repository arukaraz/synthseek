import { cva } from "class-variance-authority";

export const wizardShell = cva(
  "border-fg/15 bg-fg/5 focus:border-primary-500/50 focus:ring-primary-500/30 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2"
);

export const stepShellRoot = cva(
  "bg-surface/80 border-fg/10 mx-auto flex w-full max-w-xl flex-col gap-6 rounded-2xl border p-8 shadow-2xl backdrop-blur-xl"
);

export const stepIndicator = cva("h-1.5 flex-1 rounded-full transition-colors", {
  variants: {
    state: {
      filled: "bg-primary-500",
      empty: "bg-fg/10",
    },
  },
  defaultVariants: { state: "empty" },
});

export const stepEyebrow = cva("text-fg/50 text-[11px] font-semibold uppercase tracking-wider");

export const doneCard = cva("border-fg/10 bg-fg/[0.04] flex items-center gap-3 rounded-xl border p-4");

export const doneCheckBadge = cva(
  "bg-primary-500/15 text-primary-300 inline-flex h-9 w-9 items-center justify-center rounded-full"
);

export const wizardPickerCard = cva("border-fg/10 bg-fg/[0.04] flex flex-col gap-2 rounded-xl border p-3");

export const wizardPickerButton = cva(
  "border-fg/10 hover:bg-fg/5 flex items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors"
);
