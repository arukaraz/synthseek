import { cva } from "class-variance-authority";

export const dialogHeader = cva(
  "flex flex-wrap items-end justify-between gap-3 px-4 pt-4 pr-14 pb-5 outline-none sm:pt-6 sm:pr-16 sm:pb-3 sm:pl-6"
);

export const dialogTitleRow = cva("flex min-w-0 items-center gap-1.5");

export const dialogPanel = cva("flex min-h-0 min-w-0 flex-1 flex-col");

export const neverIncludeSlot = cva("pt-6");
