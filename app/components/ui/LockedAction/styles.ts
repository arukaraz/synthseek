import { cva } from "class-variance-authority";

export const lockedAction = cva(
  "focus-visible:ring-primary-400 inline-flex shrink-0 cursor-not-allowed rounded-md outline-none focus-visible:ring-2"
);
