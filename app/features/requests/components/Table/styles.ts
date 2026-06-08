import { cva } from "class-variance-authority";

export const sourceCellButton = cva(
  "text-fg/60 hover:text-primary-300 max-w-full truncate text-left text-sm underline-offset-2 transition-colors hover:underline"
);

export const priorityChip = cva(
  "border-primary-500/30 bg-primary-500/10 text-primary-300 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium"
);
