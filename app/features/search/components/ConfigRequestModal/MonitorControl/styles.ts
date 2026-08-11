import { cva } from "class-variance-authority";

export const monitorSubGrid = cva("pl-3 sm:pl-4");

export const scopeRadioList = cva("space-y-0.5");

export const scopeRadioRow = cva(
  "group flex w-full items-start gap-3 rounded-lg px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 focus-visible:ring-offset-0",
  {
    variants: {
      selected: {
        true: "bg-primary-500/10 text-fg",
        false: "bg-transparent text-fg/70 hover:bg-fg/5",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export const scopeRadioIndicator = cva(
  "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
  {
    variants: {
      selected: {
        true: "border-primary-400",
        false: "border-fg/30 group-hover:border-fg/45",
      },
    },
    defaultVariants: {
      selected: false,
    },
  }
);

export const scopeRadioDot = cva("size-2 rounded-full bg-primary-400");

export const scopeRadioTitle = cva("text-sm leading-snug transition-colors", {
  variants: {
    selected: {
      true: "text-primary-400 font-semibold",
      false: "text-fg/80 font-medium group-hover:text-fg",
    },
  },
  defaultVariants: {
    selected: false,
  },
});

export const scopeRadioDescription = cva("text-xs leading-snug", {
  variants: {
    selected: {
      true: "text-primary-400/80",
      false: "text-fg/50",
    },
  },
  defaultVariants: {
    selected: false,
  },
});
