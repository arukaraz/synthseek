import { cva } from "class-variance-authority";

export const controlList = cva("flex flex-col gap-5");

export const controlRow = cva("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6");

export const controlText = cva("flex min-w-0 flex-col gap-0.5");

export const controlLabel = cva("text-fg text-sm font-medium");

export const controlHelp = cva("text-fg/55 text-xs");

export const controlSlot = cva("shrink-0");
