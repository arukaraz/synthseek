import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["9", "10", "11", "12", "13", "14", "15", "16"],
      tracking: ["label", "caps", "caps-wide"],
      shadow: [
        "neon-primary",
        "neon-secondary",
        "neon-accent",
        "neon-success",
        "neon-warning",
        "neon-error",
        "glass",
        "float",
        "well",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
