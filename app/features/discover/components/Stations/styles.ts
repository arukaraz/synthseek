import { cva } from "class-variance-authority";

export const stationRail = cva(
  "flex h-full snap-x snap-mandatory gap-3 [&>*]:w-[calc((100cqw-0.75rem)/2)] [&>*]:shrink-0 [&>*]:snap-start @3xl:[&>*]:w-[calc((100cqw-1.5rem)/3)] @5xl:[&>*]:w-[calc((100cqw-2.25rem)/4)]"
);
