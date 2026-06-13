import { cva } from "class-variance-authority";

export const dialogContent = cva(
  "border-fg/10 bg-surface/95 sm:bg-surface/90 from-primary-600/15 to-accent-600/15 fixed z-50 w-full border bg-linear-to-br shadow-2xl duration-200 sm:backdrop-blur-2xl",
  {
    variants: {
      animation: {
        default:
          "left-[50%] grid max-w-lg translate-x-[-50%] gap-6 rounded-2xl p-6 top-4 max-h-[calc(100dvh-1rem-env(safe-area-inset-bottom,0px))] overflow-y-auto sm:top-[50%] sm:max-h-[90vh] sm:translate-y-[-50%] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
        sheet:
          "inset-x-0 bottom-0 max-h-[85dvh] rounded-t-2xl sm:inset-x-auto sm:left-[50%] sm:bottom-auto sm:top-[50%] sm:max-w-sm sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0 sm:data-[state=open]:zoom-in-95 sm:data-[state=closed]:zoom-out-95",
      },
    },
    defaultVariants: {
      animation: "default",
    },
  }
);
