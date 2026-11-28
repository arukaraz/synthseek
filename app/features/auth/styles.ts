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

export const signInBackdrop = cva(
  "bg-surface pointer-events-none fixed inset-0 z-0 overflow-hidden transition-opacity duration-500 motion-reduce:transition-none",
  {
    variants: {
      ready: { true: "opacity-100", false: "opacity-0" },
    },
    defaultVariants: { ready: false },
  }
);

export const signInCollage = cva("auth-collage absolute inset-0 block h-full w-full object-cover object-center");

export const signInScrim = cva("auth-scrim absolute inset-0");

export const signInStage = cva("fixed inset-0 z-10 flex flex-col overflow-y-auto sm:flex-row");

export const signInSheet = cva(
  "auth-sheet border-fg/[0.12] before:bg-fg/25 relative mt-auto flex w-full flex-col gap-[1.125rem] rounded-t-3xl border-t px-5 pt-[1.375rem] pb-[max(1.625rem,env(safe-area-inset-bottom))] before:h-1 before:w-10 before:self-center before:rounded-full before:content-[''] sm:mt-0 sm:ml-auto sm:min-h-full sm:w-[24.5rem] sm:shrink-0 sm:justify-center sm:rounded-none sm:border-t-0 sm:border-l sm:py-9 sm:pr-[max(1.875rem,env(safe-area-inset-right))] sm:pl-[1.875rem] sm:before:hidden"
);

export const authHeader = cva("flex flex-col items-start gap-1.5");

export const authEyebrow = cva("text-fg-muted text-11 font-bold uppercase tracking-caps-wide");

export const authDivider = cva("flex items-center gap-3");

export const authDividerRule = cva("bg-fg/10 h-px flex-1");

export const authDividerLabel = cva("text-fg-muted text-11 font-medium uppercase tracking-wide");

export const authHelper = cva("text-fg-muted text-12");

export const signInFooter = cva("border-fg/10 flex items-center justify-between gap-3 border-t pt-3");

export const signInMethodsColumn = cva("flex flex-col gap-3");

export const signInForm = cva("flex flex-col gap-3.5");

export const signInFields = cva("m-0 flex min-w-0 flex-col gap-3.5 border-0 p-0");

export const signInNotice = cva("status-strip", {
  variants: {
    tone: {
      error: "status-strip-error",
      neutral: "status-strip-neutral",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const signInNoticeGlyph = cva("status-strip-glyph size-4");

export const signInNoticeBody = cva("status-strip-body");

export const signInNoticeTitle = cva("font-semibold");

export const authProviderButton = cva(
  "text-fg focus-visible:ring-primary-500 flex w-full items-center justify-center gap-2 rounded-xl border font-bold outline-none transition-all hover:-translate-y-px focus-visible:ring-2 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-70",
  {
    variants: {
      provider: {
        oidc: "bg-primary-500/15 hover:bg-primary-500/25",
        jellyfin: "bg-(--brand-jellyfin)/15 hover:bg-(--brand-jellyfin)/25",
      },
      prominent: {
        true: "text-15 h-[3.125rem]",
        false: "h-11 text-sm",
      },
      phase: {
        idle: "",
        pending: "",
        error: "border-destructive/60",
      },
    },
    compoundVariants: [
      {
        provider: "oidc",
        phase: ["idle", "pending"],
        class: "border-primary-500/35 hover:border-primary-500/55",
      },
      {
        provider: "jellyfin",
        phase: ["idle", "pending"],
        class: "border-(--brand-jellyfin)/35 hover:border-(--brand-jellyfin)/55",
      },
      {
        provider: "oidc",
        prominent: true,
        class:
          "shadow-[0_0_28px_-8px_var(--color-primary-500),inset_0_1px_0_color-mix(in_oklab,var(--hairline)_12%,transparent)]",
      },
    ],
    defaultVariants: { prominent: false, phase: "idle" },
  }
);

export const authProviderIcon = cva("size-[1.125rem] shrink-0", {
  variants: {
    provider: {
      oidc: "text-primary-400",
      jellyfin: "text-(--brand-jellyfin)",
    },
    phase: {
      idle: "",
      pending: "animate-spin",
      error: "",
    },
  },
  defaultVariants: { phase: "idle" },
});

export const authProviderWord = cva("font-extrabold", {
  variants: {
    provider: {
      oidc: "text-primary-400",
      jellyfin: "text-(--brand-jellyfin)",
    },
  },
});

export const authQuietLink = cva(
  "text-fg-muted hover:text-fg focus-visible:ring-primary-500 text-13 self-center rounded px-1 font-medium underline-offset-4 outline-none hover:underline focus-visible:ring-2"
);

export const signInLoading = cva("flex min-h-24 items-center justify-center");

export const signInRedirect = cva("flex flex-col items-center gap-3 py-4 text-center");

export const signInRedirectText = cva("text-fg text-sm font-medium");
