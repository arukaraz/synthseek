import { cva, type VariantProps } from "class-variance-authority";

export const roleChip = cva(
  "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1",
  {
    variants: {
      tone: {
        owner: "bg-primary-500/15 text-primary-300 ring-primary-500/30",
        admin: "bg-secondary-500/15 text-secondary-300 ring-secondary-500/30",
        trusted: "bg-accent-500/15 text-accent-400 ring-accent-500/30",
        member: "ring-fg/10 bg-fg/5 text-fg/60",
      },
    },
    defaultVariants: {
      tone: "member",
    },
  }
);

export type RoleChipVariantProps = VariantProps<typeof roleChip>;
