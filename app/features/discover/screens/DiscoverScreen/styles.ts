import { cva } from "class-variance-authority";

export const scrollRegion = cva("relative h-full overflow-auto");

export const pageStack = cva("flex flex-col gap-6 p-4 sm:p-6 lg:p-8");

export const srOnlyHeading = cva("sr-only");
