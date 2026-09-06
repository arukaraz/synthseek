import { cva } from "class-variance-authority";

import type { PanelAnchorPoint } from "./types";
import type { CSSProperties } from "react";

type CssVars = CSSProperties & Record<`--${string}`, string>;

export const playerRoot = cva("pointer-events-none fixed inset-0 z-40");

export const playerDock = cva(
  "player-metrics @container pointer-events-auto absolute inset-x-0 bottom-[var(--height-bottom-nav)] flex flex-col sm:bottom-0"
);

export const headerPlayer = cva(
  "player-metrics @container flex w-[var(--width-player-compact)] max-w-[34vw] min-w-0 flex-col"
);

export const chainStrip = cva(
  "player-scroll-fade scrollbar-none border-fg-muted/15 bg-surface-sunken/30 flex h-[30px] items-center gap-2.5 overflow-x-auto border-t px-5 whitespace-nowrap backdrop-blur-[18px]"
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

export const bar = cva("flex h-[var(--player-bar-height)] flex-col justify-center @player:gap-1", {
  variants: {
    placement: {
      dock: "bg-surface-overlay/95 border-primary-500/25 border-t px-3 backdrop-blur-[18px] @player:px-5",
      header: "bg-transparent",
    },
  },
  defaultVariants: { placement: "dock" },
});

export const barTop = cva("flex w-full min-w-0 items-center gap-3 @player:gap-4.5");

export const barIdentity = cva("flex min-w-0 flex-1 items-center gap-3 @player:basis-0 @player:grow");

export const barCoverButton = cva(
  "focus-visible:ring-primary-500 flex shrink-0 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:outline-none"
);

export const barTextColumn = cva("flex min-w-0 flex-col gap-0.5", {
  variants: {
    folded: {
      true: "@max-player:hidden",
      false: "",
    },
  },
  defaultVariants: { folded: false },
});

export const barNameRow = cva("flex min-w-0 items-center gap-1.5");

export const barNameButton = cva(
  "focus-visible:ring-primary-500 flex min-w-0 items-center rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none @player:cursor-default"
);

export const barTitle = cva("text-fg hidden min-w-0 truncate text-[13.5px] leading-tight font-semibold @player:block");

export const barTitleRow = cva("block min-w-0 truncate text-[13.5px] leading-tight @player:hidden");

export const barTitleStrong = cva("text-fg font-semibold");

export const barTitleArtist = cva("text-fg-muted");

export const barDeviceLine = cva("flex items-center gap-1 truncate text-[11px] leading-tight", {
  variants: {
    remote: {
      true: "text-secondary-400",
      false: "text-fg-muted @player:hidden",
    },
  },
  defaultVariants: { remote: false },
});

export const barSubtitle = cva("text-fg-muted hidden truncate text-[11.5px] leading-tight @player:block");

export const barTransport = cva("order-3 flex shrink-0 items-center gap-1 @player:order-none @player:gap-3.5", {
  variants: {
    folded: {
      true: "@max-player:hidden",
      false: "",
    },
  },
  defaultVariants: { folded: false },
});

export const barProgress = cva("hidden w-full min-w-0 items-center gap-3 @player:flex");

export const barExtras = cva(
  "order-2 flex shrink-0 items-center gap-1 @player:order-none @player:basis-0 @player:grow @player:justify-end @player:gap-2.5"
);

export const volumeGroup = cva("items-center gap-2", {
  variants: {
    size: {
      bar: "hidden @player-wide:flex",
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
        compact: "size-9 @player:size-8",
        inline: "size-6",
        transport: "size-11 @player:size-8",
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
        bar: "size-11 @player:size-9.5",
        stage: "size-14 @player:size-15",
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
      bar: "size-10 rounded-md @player:size-12.5",
      stage: "size-[min(60vw,24vh,268px)] rounded-xl @player:size-[min(60vw,32vh,268px)]",
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
      stage: "h-9 sm:h-[58px]",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveCanvas = cva("pointer-events-none block size-full");

export const barMobileProgress = cva("bg-fg-muted/20 absolute inset-x-0 -bottom-0.5 h-0.5 @player:hidden");

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

export const panelAnchor = cva("player-metrics pointer-events-auto fixed z-70", {
  variants: {
    width: {
      devices: "sm:w-[306px]",
    },
    chain: {
      true: "player-metrics-chain",
      false: "",
    },
    anchored: {
      true: "inset-x-0 bottom-0 sm:inset-x-auto sm:bottom-auto sm:top-[var(--player-anchor-top)] sm:left-[var(--player-anchor-left)]",
      false: "player-panel-anchor inset-x-0 bottom-0 sm:inset-x-auto sm:right-0 sm:bottom-[var(--player-bar-height)]",
    },
  },
  defaultVariants: { width: "devices", chain: false, anchored: false },
});

export const panelSurface = cva(
  "bg-surface-overlay border-secondary-500/30 flex flex-col overflow-hidden rounded-t-[18px] border pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-t-[14px] sm:pb-0",
  {
    variants: {
      anchored: {
        true: "sm:rounded-[14px] sm:shadow-[0_24px_60px_rgba(0,0,0,0.45)]",
        false: "border-b-0 sm:rounded-tr-none sm:border-r-0",
      },
    },
    defaultVariants: { anchored: false },
  }
);

export const deviceList = cva("flex flex-col gap-2.5 p-3.5");

export const deviceCaption = cva("text-fg-muted font-mono text-[10px] tracking-[0.14em]");

export const deviceRow = cva(
  "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
  {
    variants: {
      state: {
        playing: "border-secondary-400/70",
        idle: "border-fg-muted/25",
      },
      muted: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: { state: "idle", muted: false },
  }
);

export const modeHint = cva("text-fg-muted shrink-0 font-mono text-[10px] tracking-[0.12em] uppercase");

export const miniRoot = cva("bg-surface text-fg flex h-screen w-screen flex-col overflow-hidden");

export const miniHeader = cva("flex shrink-0 items-center gap-3 px-3.5 pt-3 pb-1");

export const miniTextColumn = cva("flex min-w-0 flex-1 flex-col");

export const miniTitle = cva("text-fg truncate text-[13.5px] leading-tight font-semibold");

export const miniArtist = cva("text-fg-muted truncate text-[11.5px] leading-tight");

export const miniTransport = cva("flex shrink-0 items-center justify-center gap-3.5 px-3.5 py-1");

export const miniProgress = cva("flex w-full min-w-0 shrink-0 items-center gap-2.5 px-3.5");

export const miniChevronRow = cva("flex shrink-0 items-center justify-center");

export const miniExtras = cva("flex shrink-0 items-center justify-center gap-1 px-3.5 pb-1");

export const miniListCaption = cva("text-fg-muted shrink-0 px-3.5 pt-2 pb-1 font-mono text-[10px] tracking-[0.14em]");

export const miniList = cva("scrollbar-none flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto px-3.5");

export const miniRow = cva("flex shrink-0 items-center gap-3 rounded-lg py-1.5");

export const miniRowThumb = cva("bg-fg-muted/15 size-10 shrink-0 rounded-md");

export const miniRowText = cva("flex min-w-0 flex-1 flex-col gap-1.5");

export const miniRowTitle = cva("bg-fg-muted/15 h-2.5 w-1/2 rounded-full");

export const miniRowSub = cva("bg-fg-muted/10 h-2 w-3/4 rounded-full");

export const miniFooter = cva("shrink-0 px-3.5 pt-2 pb-3");

export const miniLibraryButton = cva(
  "bg-primary-500 text-primary-foreground focus-visible:ring-primary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-[13px] font-semibold transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
);

export const deviceIcon = cva("size-4.5 shrink-0", {
  variants: {
    state: {
      playing: "text-secondary-400",
      idle: "text-fg-muted",
    },
  },
  defaultVariants: { state: "idle" },
});

export const deviceName = cva("text-fg min-w-0 flex-1 truncate text-[13.5px] font-semibold");

export const barDesktopExtras = cva("hidden shrink-0 items-center gap-2.5 @player:flex");

export const barMoreGroup = cva(
  "player-scroll-fade scrollbar-none flex items-center overflow-x-auto overflow-y-hidden transition-all duration-200 ease-out @player:hidden",
  {
    variants: {
      open: {
        true: "min-w-0 grow translate-x-0 gap-0.5 opacity-100 [&>button]:size-8 [&>span]:shrink-0 [&>button]:shrink-0",
        false: "invisible max-w-0 shrink-0 -translate-x-2 gap-0 opacity-0",
      },
    },
    defaultVariants: { open: false },
  }
);

export const stage = cva("@container pointer-events-auto fixed inset-0 z-60 flex flex-col overflow-hidden");

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

export const stageHeader = cva(
  "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-end gap-3 px-5 py-4 [&>*]:pointer-events-auto"
);

export const stageMain = cva(
  "relative flex min-h-0 flex-1 flex-col overflow-hidden px-6 text-center md:px-11 md:text-left"
);

export const stageMeta = cva("flex max-w-[430px] flex-col items-center gap-1.5 sm:gap-2.5 md:items-start");

export const stageTitle = cva(
  "text-fg line-clamp-2 text-[26px] leading-tight font-bold tracking-[-0.02em] sm:line-clamp-none sm:text-[34px]"
);

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
  "relative flex shrink-0 flex-col gap-4 px-5 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))] sm:px-15"
);

export const stageScrubRow = cva("flex items-center gap-3.5");

export const stageTransport = cva("flex items-center justify-center gap-7 sm:gap-[30px]");

export const srOnly = cva("sr-only");

export function progressVars(percent: number): CssVars {
  return { "--player-progress": `${percent.toFixed(2)}%` };
}

export function anchorVars(point: PanelAnchorPoint | null): CssVars | undefined {
  if (point === null) return undefined;
  return { "--player-anchor-top": `${point.top}px`, "--player-anchor-left": `${point.left}px` };
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
      track: "flex-col gap-4 text-center sm:gap-6 md:flex-row md:gap-11 md:text-left",
    },
  },
});

export const stageVolume = cva("flex justify-center");

export const lyricsPane = cva("flex h-full min-h-0 w-full max-w-[900px] flex-col items-center gap-3 pb-3");

export const lyricsScroll = cva("player-lyrics-fade scrollbar-none min-h-0 w-full flex-1 overflow-y-auto px-2");

export const lyricsBody = cva("flex flex-col items-center gap-2.5 py-[32vh] text-center sm:gap-3 sm:py-[42vh]");

export const lyricsLine = cva(
  "player-lyric-line focus-visible:ring-primary-500 w-full rounded-lg px-2 text-[25px] leading-tight font-bold tracking-[-0.01em] transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:outline-none sm:text-[46px]",
  {
    variants: {
      state: {
        active: "text-fg scale-[1.02]",
        resting: "text-fg/30 hover:text-fg/60",
        plain: "text-fg/70",
      },
      depth: {
        near: "",
        mid: "blur-[1.5px]",
        far: "blur-[3px] opacity-70",
      },
      seekable: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: { state: "plain", depth: "near", seekable: false },
  }
);

export const lyricsEmpty = cva("text-fg-muted py-10 text-center text-base");

export const lyricsUntimed = cva("text-fg-muted text-center text-xs");
