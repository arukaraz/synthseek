import { cva } from "class-variance-authority";

export const noticeRoot = cva(
  "flex gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-100"
);

export const noticeIcon = cva("size-4 shrink-0 text-amber-300");

export const noticeBody = cva("flex flex-col gap-1.5 text-amber-100/90");

export const noticeTitle = cva("text-amber-200 text-xs font-semibold");

export const noticeList = cva("flex flex-col gap-1 text-amber-100/80");

export const noticeLink = cva("text-amber-200 underline underline-offset-2 hover:text-amber-100");
