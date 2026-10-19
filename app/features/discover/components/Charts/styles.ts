import { cva } from "class-variance-authority";

export const chartsBody = cva("@container flex min-h-0 flex-1 flex-col");

export const chartsList = cva(
  "@3xl:grid-flow-col @3xl:grid-cols-2 @3xl:grid-rows-[repeat(5,auto)] @3xl:content-start @3xl:gap-x-6",
  {
    variants: {
      wide: {
        true: "@3xl:grid",
        false: "",
      },
    },
    defaultVariants: { wide: false },
  }
);
