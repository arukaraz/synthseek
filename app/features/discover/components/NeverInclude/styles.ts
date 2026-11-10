import { cva } from "class-variance-authority";

export const vetoBlock = cva("flex min-w-0 flex-col gap-1.5");

export const vetoLabel = cva("text-fg/70 text-xs font-medium");

export const vetoTagList = cva("flex flex-wrap gap-1.5");

export const vetoTag = cva(
  "border-fg/15 text-fg inline-flex max-w-full min-w-0 items-center gap-1 rounded-full border py-0.5 pr-1 pl-2.5 text-xs"
);

export const vetoTagText = cva("min-w-0 truncate");
