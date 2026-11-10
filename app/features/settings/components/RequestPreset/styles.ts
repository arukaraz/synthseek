import { cva } from "class-variance-authority";

export const presetEditorBody = cva("flex flex-col gap-4 sm:gap-5");

export const presetFollowNote = cva("text-fg/60 text-sm");

export const presetLocked = cva("border-fg/10 bg-fg/5 text-fg/70 flex items-start gap-3 rounded-lg border p-3 text-sm");

export const presetLockedIcon = cva("text-fg/50 mt-0.5 size-4 shrink-0");
