import { cva } from "class-variance-authority";

export const authLayoutRoot = cva(
  "bg-surface relative flex min-h-screen w-full flex-col items-center justify-center px-4 py-10"
);

export const authLayoutContent = cva("relative z-10 flex w-full justify-center");
