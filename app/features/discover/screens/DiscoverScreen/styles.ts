import { cva } from "class-variance-authority";

export const scrollRegion = cva("relative h-full overflow-auto");

export const pageStack = cva("flex flex-col gap-6 p-4 sm:p-6 lg:p-8");

export const topRegion = cva("grid grid-cols-1 gap-6 md:grid-cols-2 md:items-stretch");

export const middleRegion = cva("grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-stretch");

export const middleColumn = cva("flex min-w-0 flex-col gap-6");

export const genresFill = cva("flex flex-1");

export const srOnlyHeading = cva("sr-only");
