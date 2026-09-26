import { cva } from "class-variance-authority";

export const syncTargetItem = cva("flex w-full items-center gap-2 px-3 py-2 text-sm");

export const syncTargetChip = cva("flex size-6 shrink-0 items-center justify-center rounded");

export const edgeSeparator = cva("first:hidden last:hidden");
