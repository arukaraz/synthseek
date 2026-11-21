import { cva } from "class-variance-authority";

export const credentialName = cva("text-fg break-words font-medium");

export const credentialTime = cva("whitespace-nowrap tabular-nums");

export const credentialRevokeCell = cva("w-12 text-right");

export const tokenBox = cva("bg-fg/5 ring-fg/10 text-fg block break-all rounded-lg p-3 font-mono text-xs ring-1");

export const connectMethods = cva("grid gap-3 sm:grid-cols-2");

export const connectMethod = cva("border-fg/10 bg-fg/5 flex flex-col items-start gap-2 rounded-lg border p-3");

export const connectMethodBody = cva("text-fg/70 text-xs leading-relaxed");

export const connectionBody = cva("flex flex-col gap-4");

export const connectionMeta = cva("text-fg/50 text-xs");

export const connectionError = cva("text-destructive-vivid text-xs");

export const connectionFooterRow = cva("flex flex-wrap items-center justify-between gap-3");
