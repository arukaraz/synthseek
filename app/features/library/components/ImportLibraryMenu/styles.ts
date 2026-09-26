import { cva } from "class-variance-authority";

export const importTrigger = cva("h-9 shrink-0");

export const importMenuItem = cva("flex w-full items-center gap-2 px-3 py-2 text-sm");

export const importChip = cva("flex size-6 shrink-0 items-center justify-center rounded", {
  variants: { kind: { provider: "", file: "bg-fg/5 text-fg/70" } },
});
