import { cva } from "class-variance-authority";

export const dialogRoot = cva(
  "sm:h-auto sm:max-h-[min(90dvh,860px)] sm:w-[calc(100vw-2rem)] sm:max-w-[760px] pb-[env(safe-area-inset-bottom,0px)] sm:pb-0"
);

export const header = cva("flex flex-wrap items-center gap-x-4 gap-y-2 px-5 pt-6 pr-16 sm:px-7 sm:pt-7");

export const heading = cva(
  "from-secondary-400 via-primary-400 to-accent-400 bg-linear-to-r bg-clip-text text-4xl leading-none font-extrabold tracking-tight text-transparent drop-shadow-[0_0_22px_var(--color-primary-500)] sm:text-5xl"
);

export const versionPill = cva(
  "text-secondary-400 border-secondary-400/50 bg-secondary-400/10 rounded-full border px-3 py-1 font-mono text-sm font-bold shadow-[0_0_18px_-4px_var(--color-secondary-400)]"
);

export const progress = cva("flex gap-1.5 px-5 pt-3 sm:px-7");

export const segment = cva(
  "flex h-6 flex-1 items-center before:h-1 before:w-full before:rounded-full before:transition-colors before:content-['']",
  {
    variants: {
      state: {
        done: "before:bg-primary-400/60",
        current: "before:bg-secondary-400",
        todo: "before:bg-fg/15",
      },
    },
  }
);

export const body = cva("min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7 sm:py-5");

export const card = cva(
  "flex flex-col gap-4 motion-safe:animate-in motion-safe:fade-in-0 motion-safe:slide-in-from-bottom-2"
);

export const visual = cva(
  "from-primary-500/40 via-accent-500/15 to-secondary-500/25 border-fg/10 grid aspect-[16/7] place-items-center rounded-xl border bg-linear-to-br"
);

export const visualIcon = cva("text-fg/90 size-14 sm:size-16");

export const cardTitle = cva("text-fg text-2xl font-bold tracking-tight text-balance sm:text-3xl");

export const cardBody = cva("text-fg/70 max-w-[60ch] text-base leading-relaxed");

export const cardLink = cva(
  "text-primary-400 hover:text-primary-500 inline-flex items-center gap-1.5 self-start text-sm font-semibold underline-offset-4 hover:underline"
);

export const cardLinkIcon = cva("size-4");

export const footer = cva(
  "border-fg/10 bg-surface/80 flex flex-none items-center justify-between gap-3 border-t px-5 py-3.5 backdrop-blur-md sm:px-7"
);

export const footerTitle = cva("text-fg/45 min-w-0 truncate text-sm");

export const footerCount = cva("text-fg/45 shrink-0 font-mono text-xs whitespace-nowrap tabular-nums");

export const primaryButton = cva(
  "bg-primary-500 hover:bg-primary-600 text-primary-foreground min-h-11 min-w-28 rounded-xl px-5 text-sm font-semibold shadow-[0_8px_24px_-10px_var(--color-primary-500)] transition-colors"
);

export const ghostButton = cva(
  "border-fg/15 bg-fg/5 hover:bg-fg/10 text-fg min-h-11 rounded-xl border px-4 text-sm font-medium transition-colors"
);

export const openButton = cva(
  "text-fg/70 bg-fg/[0.03] ring-fg/15 hover:text-fg hover:bg-fg/[0.06] inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold ring-1 transition-colors"
);

export const openButtonIcon = cva("text-secondary-400 size-4");
