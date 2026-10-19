import { cva } from "class-variance-authority";

export const stationScroller = cva("flex min-h-0 flex-1");

export const stationRail = cva(
  "flex h-full snap-x snap-mandatory gap-3 [&>*]:w-[46%] [&>*]:shrink-0 [&>*]:snap-start @md:[&>*]:w-[38%]"
);
