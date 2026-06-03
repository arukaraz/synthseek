import { cva } from "class-variance-authority";

export {
  authEyeToggle,
  authFieldLabel,
  authInputControl,
  authInputIcon,
  authInputRow,
  authPlexButton,
  authPlexIcon,
  authPlexWord,
  authEmailButton as authSubmitButton,
} from "@components/ui/styles";

export const authCard = cva(
  "auth-card relative z-10 flex w-full max-w-[27rem] flex-col gap-5 rounded-3xl border border-fg/[0.09] p-6 sm:p-9 sm:pb-[1.875rem] sm:backdrop-blur-[18px]"
);

export const authHeader = cva("flex flex-col items-center gap-1.5");

export const authEyebrow = cva("text-fg-muted text-[0.6875rem] font-bold uppercase tracking-[0.18em]");

export const authDivider = cva("flex items-center gap-3");

export const authDividerRule = cva("bg-fg/10 h-px flex-1");

export const authDividerLabel = cva("text-fg-muted text-[0.6875rem] font-medium uppercase tracking-wide");

export const authHelper = cva("text-fg-muted mt-2 text-center text-[0.78rem]");
