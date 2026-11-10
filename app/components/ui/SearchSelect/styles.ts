import { cva } from "class-variance-authority";

export const searchSelectContent = cva(
  "flex w-(--radix-popover-trigger-width) max-w-none min-w-56 flex-col gap-1 p-1.5 text-sm"
);

export const searchSelectChevron = cva("text-fg/50 size-4 shrink-0");

export const searchSelectField = cva("relative");

export const searchSelectIcon = cva("text-fg/50 pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2");

export const searchSelectInput = cva("w-full pl-9");

export const searchSelectList = cva("flex max-h-64 flex-col overflow-y-auto");

export const searchSelectOption = cva(
  "flex min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm",
  {
    variants: {
      active: {
        true: "bg-fg/10 text-fg",
        false: "text-fg/80",
      },
    },
    defaultVariants: { active: false },
  }
);

export const searchSelectOptionText = cva("flex min-w-0 flex-col");

export const searchSelectOptionLabel = cva("truncate");

export const searchSelectOptionDescription = cva("text-fg/50 truncate text-xs");

export const searchSelectCheck = cva("text-primary-500 size-4 shrink-0");

export const searchSelectEmpty = cva("text-fg/60 px-2 py-1.5 text-sm");
