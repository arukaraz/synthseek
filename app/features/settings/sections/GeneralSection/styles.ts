import { cva } from "class-variance-authority";

export const apiKeyRow = cva(
  "border-fg/10 flex items-center justify-between gap-3 border-b py-3.5 first:pt-0 last:border-b-0 last:pb-0"
);

export const tokenBox = cva("bg-bg-soft/40 ring-fg/10 text-fg block break-all rounded-lg p-3 font-mono text-xs ring-1");

export const connectList = cva("flex flex-col gap-2");

export const connectLabel = cva("text-fg font-semibold");
