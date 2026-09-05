import { cva } from "class-variance-authority";

import { PROGRESS_EASE_MS } from "./constants";
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

export const chainSeparator = cva("text-fg-muted/60 size-2.5 shrink-0");

export const bar = cva(
  "border-primary-500/25 bg-surface-overlay/95 flex h-16 items-center gap-3 border-t px-3 backdrop-blur-[18px] sm:h-21 sm:gap-4.5 sm:px-5"
);

export const barIdentity = cva(
  "flex min-w-0 flex-1 items-center gap-3 sm:w-auto sm:max-w-[42%] sm:flex-none sm:shrink sm:pr-9"
);

export const barCoverButton = cva(
  "focus-visible:ring-primary-500 flex shrink-0 rounded-lg focus-visible:ring-2 focus-visible:outline-none sm:cursor-default"
);

export const barTextColumn = cva("flex min-w-0 flex-col gap-0.5");

export const barNameRow = cva("flex min-w-0 items-center gap-1.5");

export const barNameButton = cva(
  "focus-visible:ring-primary-500 flex min-w-0 items-center rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none sm:cursor-default"
);

export const barTitle = cva("text-fg hidden min-w-0 truncate text-[13.5px] leading-tight font-semibold sm:block");

export const barTitleRow = cva("block min-w-0 truncate text-[13.5px] leading-tight sm:hidden");

export const barTitleStrong = cva("text-fg font-semibold");

export const barTitleArtist = cva("text-fg-muted");

export const barDeviceLine = cva("flex items-center gap-1 truncate text-[11px] leading-tight", {
  variants: {
    remote: {
      true: "text-secondary-400",
      false: "text-fg-muted sm:hidden",
    },
  },
  defaultVariants: { remote: false },
});

export const barSubtitle = cva("text-fg-muted hidden truncate text-[11.5px] leading-tight sm:block");

export const barTransport = cva("order-3 flex shrink-0 items-center gap-1 sm:order-none sm:gap-3.5");

export const barProgress = cva("hidden min-w-0 flex-1 items-center gap-3 sm:flex sm:min-w-[240px]");

export const barExtras = cva("order-2 flex shrink-0 items-center gap-1 sm:order-none sm:gap-2.5");

export const volumeGroup = cva("items-center gap-2", {
  variants: {
    size: {
      bar: "hidden xl:flex",
      stage: "flex",
    },
  },
  defaultVariants: { size: "bar" },
});

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
        inline: "size-6",
        transport: "size-11 sm:size-8",
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

export const cover = cva("relative grid shrink-0 place-items-center overflow-hidden border", {
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

export const coverArtwork = cva("size-full object-cover");

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

export const volumeTrack = cva("flex h-4 cursor-pointer items-center touch-none", {
  variants: {
    size: {
      bar: "w-40",
      stage: "w-44",
    },
  },
  defaultVariants: { size: "bar" },
});

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
  "flex w-full items-center gap-2.5 rounded-[10px] border px-2.5 py-2 text-left transition-colors",
  {
    variants: {
      state: {
        playing: "border-accent-400/70",
        active: "border-primary-500/55",
        idle: "border-fg-muted/25",
      },
    },
    defaultVariants: { state: "idle" },
  }
);

export const deviceIcon = cva("size-4 shrink-0", {
  variants: {
    state: {
      playing: "text-accent-400",
      active: "text-primary-400",
      idle: "text-fg-muted",
    },
  },
  defaultVariants: { state: "idle" },
});

export const deviceName = cva("text-fg min-w-0 flex-1 truncate text-[12.5px] font-semibold");

export const barDesktopExtras = cva("hidden shrink-0 items-center gap-2.5 sm:flex");

export const barMoreGroup = cva(
  "flex shrink-0 items-center overflow-hidden transition-all duration-200 ease-out sm:hidden",
  {
    variants: {
      open: {
        true: "max-w-32 translate-x-0 gap-1 opacity-100",
        false: "invisible max-w-0 -translate-x-2 gap-0 opacity-0",
      },
    },
    defaultVariants: { open: false },
  }
);

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

export const stageMain = cva("relative flex min-h-0 flex-1 flex-col px-6 text-center md:px-11 md:text-left");

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

export const stageDeviceLine = cva("text-secondary-400 mt-0.5 flex items-center gap-1.5 text-[12.5px]");

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
    "--player-progress-ease": scrubPercent === null ? PROGRESS_EASE_MS : "0ms",
  };
}

export function progressVars(percent: number): CssVars {
  return { "--player-progress": `${percent.toFixed(2)}%` };
}

export function volumeVars(percent: number): CssVars {
  return { "--player-volume": `${Math.round(percent)}%` };
}

export const scrobbleStatus = cva(
  "focus-visible:ring-primary-500 relative grid shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      state: {
        off: "text-fg-muted",
        sending: "text-secondary-400",
        retrying: "text-warning-vivid",
        failed: "text-destructive-vivid",
      },
      size: {
        bar: "size-7",
        stage: "size-9",
      },
    },
    defaultVariants: { state: "off", size: "bar" },
  }
);

export const scrobbleDot = cva("absolute right-0.5 bottom-0.5 size-1.5 rounded-full", {
  variants: {
    state: {
      off: "bg-fg-muted/50",
      sending: "bg-secondary-400",
      retrying: "bg-warning-vivid animate-pulse",
      failed: "bg-destructive-vivid",
    },
  },
  defaultVariants: { state: "off" },
});

export const stageFlip = cva(
  "flex min-h-0 w-full flex-1 self-stretch items-center justify-center [perspective:1400px]"
);

export const stageFace = cva("flex h-full min-h-0 w-full items-center justify-center [backface-visibility:hidden]", {
  variants: {
    layout: {
      track: "flex-col gap-6 text-center md:flex-row md:gap-11 md:text-left",
    },
  },
});

export const stageVolume = cva("flex justify-center");

export const lyricsPane = cva("flex h-full min-h-0 w-full max-w-[640px] flex-col items-center gap-4 py-4");

export const lyricsScroll = cva("min-h-0 w-full flex-1 overflow-y-auto px-2");

export const lyricsBody = cva("flex flex-col gap-2 py-6 text-center");

export const lyricsLine = cva("text-[17px] leading-snug transition-colors duration-300 sm:text-[19px]", {
  variants: {
    state: {
      active: "text-fg font-semibold",
      resting: "text-fg/35",
      plain: "text-fg/70",
    },
  },
  defaultVariants: { state: "plain" },
});

export const lyricsEmpty = cva("text-fg-muted py-10 text-center text-sm");
