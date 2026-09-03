import { cva } from "class-variance-authority";
import type { CSSProperties } from "react";

type CssVars = CSSProperties & Record<`--${string}`, string>;

export const playerRoot = cva("pointer-events-none fixed inset-0 z-40");

export const playerDock = cva(
  "pointer-events-auto absolute inset-x-0 bottom-[var(--height-bottom-nav)] flex flex-col sm:bottom-0"
);

export const chainStrip = cva(
  "border-fg-muted/15 bg-surface-sunken/30 hidden h-[30px] items-center gap-2.5 overflow-hidden border-t px-5 whitespace-nowrap backdrop-blur-[18px] md:flex"
);

export const chainLabel = cva("text-fg-muted font-mono text-[9px] tracking-[0.12em]");

export const chainValue = cva("font-mono text-[10.5px]", {
  variants: {
    tone: {
      neutral: "text-fg",
      muted: "text-fg-muted",
      lossless: "text-secondary-400",
      warning: "text-warning-vivid",
      success: "text-success-vivid",
    },
  },
  defaultVariants: { tone: "neutral" },
});

export const chainButton = cva(
  "focus-visible:ring-secondary-500 rounded-sm font-mono text-[10.5px] transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      tone: {
        neutral: "text-fg",
        muted: "text-fg-muted",
        lossless: "text-secondary-400",
        warning: "text-warning-vivid",
        success: "text-success-vivid",
      },
    },
    defaultVariants: { tone: "neutral" },
  }
);

export const chainSeparator = cva("text-fg-muted/60 size-2.5 shrink-0");

export const bar = cva(
  "border-primary-500/25 bg-surface-overlay/95 flex h-16 items-center gap-3 border-t px-3 backdrop-blur-[18px] sm:h-21 sm:gap-4.5 sm:px-5"
);

export const barIdentity = cva("flex min-w-0 flex-1 items-center gap-3 sm:w-[226px] sm:flex-none");

export const barIdentityButton = cva(
  "focus-visible:ring-primary-500 flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none sm:cursor-default"
);

export const barTitle = cva("text-fg hidden truncate text-[13.5px] leading-tight font-semibold sm:block");

export const barTitleRow = cva("truncate text-[13.5px] leading-tight sm:hidden");

export const barTitleStrong = cva("text-fg font-semibold");

export const barTitleArtist = cva("text-fg-muted");

export const barDeviceLine = cva("flex items-center gap-1 truncate text-[11px] leading-tight sm:hidden", {
  variants: {
    remote: {
      true: "text-secondary-400",
      false: "text-fg-muted",
    },
  },
  defaultVariants: { remote: false },
});

export const barSubtitle = cva("text-fg-muted hidden truncate text-[11.5px] leading-tight sm:block");

export const barTransport = cva("order-3 flex shrink-0 items-center gap-1 sm:order-none sm:gap-3.5");

export const barProgress = cva("hidden min-w-0 flex-1 items-center gap-3 sm:flex");

export const barExtras = cva("order-2 flex shrink-0 items-center gap-1 sm:order-none sm:gap-2.5");

export const barVolume = cva("hidden items-center gap-2 lg:flex");

export const clock = cva("text-fg-muted shrink-0 font-mono tabular-nums", {
  variants: {
    size: {
      bar: "w-10 text-[11px]",
      stage: "w-12 text-[12px]",
    },
    align: {
      left: "text-left",
      right: "text-right",
    },
  },
  defaultVariants: { size: "bar", align: "left" },
});

export const iconButton = cva(
  "focus-visible:ring-primary-500 grid shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      tone: {
        muted: "text-fg-muted hover:text-fg",
        active: "text-primary-400 hover:bg-fg/8",
        favorite: "text-accent-400 hover:bg-fg/8",
        remote: "text-secondary-400 hover:bg-fg/8",
        warning: "text-warning-vivid hover:bg-fg/8",
        danger: "text-destructive-vivid hover:bg-fg/8",
      },
      size: {
        compact: "size-9 sm:size-8",
        stage: "size-11",
      },
    },
    defaultVariants: { tone: "muted", size: "compact" },
  }
);

export const playButton = cva(
  "bg-primary-500 text-primary-foreground focus-visible:ring-primary-400 grid shrink-0 place-items-center rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
  {
    variants: {
      size: {
        bar: "size-11 sm:size-9.5",
        stage: "size-14 sm:size-15",
      },
    },
    defaultVariants: { size: "bar" },
  }
);

export const cover = cva("grid shrink-0 place-items-center overflow-hidden border", {
  variants: {
    tone: {
      primary: "bg-primary-500/35 border-primary-500/60",
      secondary: "bg-secondary-500/35 border-secondary-500/60",
      accent: "bg-accent-500/35 border-accent-500/60",
    },
    size: {
      row: "size-7 rounded",
      bar: "size-10 rounded-md sm:size-12.5",
      stage: "size-[min(60vw,268px)] rounded-xl",
    },
  },
  defaultVariants: { tone: "primary", size: "bar" },
});

export const coverGlow = cva("", {
  variants: {
    tone: {
      primary: "shadow-[0_30px_70px_color-mix(in_oklch,var(--color-primary-500)_22%,transparent)]",
      secondary: "shadow-[0_30px_70px_color-mix(in_oklch,var(--color-secondary-500)_22%,transparent)]",
      accent: "shadow-[0_30px_70px_color-mix(in_oklch,var(--color-accent-500)_22%,transparent)]",
    },
  },
  defaultVariants: { tone: "primary" },
});

export const coverInitials = cva("text-fg font-mono", {
  variants: {
    size: {
      row: "text-[8px]",
      bar: "text-[10px]",
      stage: "text-[26px]",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveTrack = cva("relative min-w-0 flex-1 cursor-pointer touch-none", {
  variants: {
    size: {
      bar: "h-9",
      stage: "h-18 sm:h-[116px]",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveLayer = cva("absolute inset-0 overflow-hidden", {
  variants: {
    state: {
      rest: "opacity-40 saturate-50",
      played: "player-wave-played",
    },
  },
  defaultVariants: { state: "rest" },
});

export const waveSvg = cva("block h-full w-full");

export const waveLobe = cva("player-lobe", {
  variants: {
    lobe: {
      a: "player-lobe-a fill-primary-400 opacity-70",
      b: "player-lobe-b fill-secondary-400 opacity-60",
      c: "player-lobe-c fill-accent-400 opacity-50",
    },
  },
  defaultVariants: { lobe: "a" },
});

export const waveBaseline = cva("bg-fg/70 pointer-events-none absolute inset-x-0 top-1/2 h-px");

export const waveHead = cva("player-wave-head bg-fg pointer-events-none absolute top-1/2 rounded-full", {
  variants: {
    size: {
      bar: "-mt-[5px] -ml-[5px] size-2.5 shadow-[0_0_14px_3px_var(--color-secondary-400)]",
      stage: "-mt-2 -ml-2 size-4 shadow-[0_0_22px_5px_var(--color-secondary-400)]",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveScrubLabel = cva(
  "player-wave-scrub bg-surface-overlay text-secondary-400 pointer-events-none absolute z-10 -translate-x-1/2 rounded-full px-2 py-0.5 font-mono whitespace-nowrap",
  {
    variants: {
      size: {
        bar: "-top-2 text-[10px]",
        stage: "-top-3 text-[11px]",
      },
    },
    defaultVariants: { size: "bar" },
  }
);

export const barMobileProgress = cva("bg-fg-muted/20 absolute inset-x-0 -bottom-0.5 h-0.5 sm:hidden");

export const barMobileProgressFill = cva("player-bar-progress bg-primary-400 h-0.5");

export const volumeTrack = cva("flex h-4 w-23 cursor-pointer items-center touch-none");

export const volumeRail = cva("bg-fg-muted/30 relative h-1 w-full rounded-full");

export const volumeFill = cva("player-volume-fill bg-fg h-1 rounded-full");

export const volumeHead = cva("player-volume-head bg-fg absolute -top-[3px] -ml-[5px] size-2.5 rounded-full");

export const panelAnchor = cva(
  "player-metrics pointer-events-auto fixed inset-x-0 bottom-[calc(var(--height-bottom-nav)+var(--player-bar-height))] z-70 sm:inset-x-auto sm:right-0 sm:bottom-[var(--player-bar-height)]",
  {
    variants: {
      width: {
        devices: "sm:w-[306px]",
      },
      chain: {
        true: "player-metrics-chain",
        false: "",
      },
    },
    defaultVariants: { width: "devices", chain: false },
  }
);

export const panelSurface = cva(
  "bg-surface-overlay border-secondary-500/30 flex flex-col overflow-hidden rounded-tl-[14px] border border-r-0 border-b-0 sm:rounded-tr-none"
);

export const deviceList = cva("flex flex-col gap-2 p-2.5");

export const deviceCaption = cva("text-fg-muted font-mono text-[10px] tracking-[0.14em]");

export const deviceRow = cva(
  "hover:bg-primary-500/10 focus-visible:ring-primary-500 flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      state: {
        active: "border-primary-500/55",
        idle: "border-fg-muted/25",
        unarmed: "border-fg-muted/25 border-dashed",
      },
    },
    defaultVariants: { state: "idle" },
  }
);

export const deviceDot = cva("size-2.25 shrink-0 rounded-full", {
  variants: {
    state: {
      active: "bg-primary-400",
      idle: "bg-primary-500/55",
      third: "border-fg-muted border-[1.5px]",
      unarmed: "border-fg-muted border-[1.5px] border-dashed",
    },
  },
  defaultVariants: { state: "idle" },
});

export const deviceName = cva("text-fg truncate text-[12.5px] font-semibold");

export const deviceDetail = cva("text-fg-muted truncate text-[10.5px]");

export const deviceCapability = cva("shrink-0 text-right font-mono text-[9.5px]", {
  variants: {
    kind: {
      own: "text-primary-400",
      third: "text-fg-muted",
      unarmed: "text-warning-vivid",
    },
  },
  defaultVariants: { kind: "own" },
});

export const deviceFootnote = cva("text-fg-muted px-1 pb-1 text-[10.5px] leading-relaxed");

export const notice = cva(
  "player-metrics border-fg-muted/25 bg-surface-overlay pointer-events-auto fixed bottom-[calc(var(--height-bottom-nav)+var(--player-dock-height))] left-3 z-70 flex max-w-[460px] items-center gap-2.5 rounded-[10px] border px-3.5 py-2.5 sm:bottom-[var(--player-dock-height)] sm:left-5",
  {
    variants: {
      chain: {
        true: "player-metrics-chain",
        false: "",
      },
    },
    defaultVariants: { chain: false },
  }
);

export const noticeDot = cva("size-2 shrink-0 rounded-full bg-current", {
  variants: {
    tone: {
      info: "text-secondary-400",
      warning: "text-warning-vivid",
      danger: "text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "info" },
});

export const noticeText = cva("text-fg text-[12.5px]");

export const stage = cva("pointer-events-auto fixed inset-0 z-60 flex flex-col overflow-hidden");

export const stageBackdrop = cva("bg-surface/98 absolute inset-0 backdrop-blur-[26px]");

export const stageTint = cva("absolute inset-0", {
  variants: {
    tone: {
      primary: "bg-[radial-gradient(circle_at_50%_35%,var(--color-primary-500)_0%,transparent_60%)] opacity-20",
      secondary: "bg-[radial-gradient(circle_at_50%_35%,var(--color-secondary-500)_0%,transparent_60%)] opacity-20",
      accent: "bg-[radial-gradient(circle_at_50%_35%,var(--color-accent-500)_0%,transparent_60%)] opacity-20",
    },
  },
  defaultVariants: { tone: "primary" },
});

export const stageHeader = cva("relative flex items-center justify-end gap-3 px-5 py-4");

export const stageMain = cva(
  "relative flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 text-center md:flex-row md:gap-11 md:px-11 md:text-left"
);

export const stageMeta = cva("flex max-w-[430px] flex-col items-center gap-2.5 md:items-start");

export const stageTitle = cva("text-fg text-[26px] leading-tight font-bold tracking-[-0.02em] sm:text-[34px]");

export const stageArtist = cva("text-fg text-[16px]");

export const stageAlbum = cva("text-fg-muted text-[14px]");

export const stageChips = cva("mt-1 flex flex-wrap items-center justify-center gap-2 md:justify-start");

export const stageChip = cva("rounded-full border px-2.5 py-1 font-mono text-[11px] whitespace-nowrap", {
  variants: {
    tone: {
      lossless: "border-secondary-500/40 text-secondary-400",
      warning: "border-warning-vivid/50 text-warning-vivid",
      success: "border-fg-muted/25 text-success-vivid",
      muted: "border-fg-muted/25 text-fg-muted",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const stageChipButton = cva(
  "focus-visible:ring-secondary-500 rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none"
);

export const stageActions = cva("mt-1.5 flex items-center gap-4");

export const stageFooter = cva(
  "relative flex flex-col gap-4 px-5 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-15"
);

export const stageScrubRow = cva("flex items-center gap-3.5");

export const stageTransport = cva("flex items-center justify-center gap-7 sm:gap-[30px]");

export const srOnly = cva("sr-only");

export function waveVars(progressPercent: number, scrubPercent: number | null, animating: boolean): CssVars {
  return {
    "--player-progress": `${progressPercent.toFixed(2)}%`,
    "--player-scrub": `${(scrubPercent ?? progressPercent).toFixed(2)}%`,
    "--player-wave-state": animating ? "running" : "paused",
  };
}

export function progressVars(percent: number): CssVars {
  return { "--player-progress": `${percent.toFixed(2)}%` };
}

export function volumeVars(percent: number): CssVars {
  return { "--player-volume": `${Math.round(percent)}%` };
}
