import { cva } from "class-variance-authority";

export const rangeSliderRoot = cva("relative flex h-6 w-full items-center");

export const rangeSliderRail = cva("absolute inset-x-2 h-1");

export const rangeSliderTrack = cva("bg-fg/15 absolute inset-0 rounded-full");

export const rangeSliderFill = cva("bg-primary-500 absolute inset-y-0 rounded-full");

export const rangeSliderThumb = cva(
  "pointer-events-none absolute inset-x-0 m-0 h-6 w-full appearance-none bg-transparent outline-none [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-solid [&::-moz-range-thumb]:border-primary-400 [&::-moz-range-thumb]:bg-surface [&::-moz-range-track]:bg-transparent [&::-webkit-slider-runnable-track]:bg-transparent [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-solid [&::-webkit-slider-thumb]:border-primary-400 [&::-webkit-slider-thumb]:bg-surface [&:focus-visible::-moz-range-thumb]:ring-2 [&:focus-visible::-moz-range-thumb]:ring-primary-400/60 [&:focus-visible::-webkit-slider-thumb]:ring-2 [&:focus-visible::-webkit-slider-thumb]:ring-primary-400/60",
  {
    variants: {
      leads: {
        true: "z-20",
        false: "z-10",
      },
    },
    defaultVariants: { leads: false },
  }
);
