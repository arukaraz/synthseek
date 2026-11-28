import type { CssVars } from "@theme/utilities/types";
import { cva } from "class-variance-authority";

import type { PanelAnchorPoint } from "./types";

export const playerRoot = cva("pointer-events-none fixed inset-0 z-40");

export const playerDock = cva(
  "player-metrics @container pointer-events-auto absolute inset-x-0 bottom-[var(--height-bottom-nav)] flex flex-col sm:inset-x-[var(--player-dock-gap)] sm:bottom-[var(--player-dock-gap)] sm:overflow-hidden sm:rounded-2xl sm:border-x sm:border-b sm:border-primary-500/25 sm:shadow-2xl"
);

export const playbackProblem = cva("", {
  variants: {
    visible: {
      true: "text-destructive-vivid bg-surface/90 flex items-center gap-2 px-4 py-2 text-13",
      false: "sr-only",
    },
  },
  defaultVariants: { visible: false },
});

export const headerPlayer = cva(
  "player-metrics flex w-max max-w-[min(var(--width-player-compact),42vw)] min-w-0 flex-col"
);

export const chainStrip = cva(
  "player-scroll-fade scrollbar-none border-fg-muted/15 bg-surface-sunken/30 flex h-7.5 items-center gap-2.5 overflow-x-auto px-5 whitespace-nowrap backdrop-blur-lg",
  {
    variants: {
      placement: {
        dock: "border-t",
        header: "pointer-events-auto fixed inset-x-0 top-[var(--height-header-wide)] z-40 border-b",
      },
    },
    defaultVariants: { placement: "dock" },
  }
);

export const chainLabel = cva("text-fg-muted font-mono text-9 tracking-caps");

export const chainValue = cva("font-mono text-10", {
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

export const chainButton = cva(
  "focus-visible:ring-primary-500 cursor-pointer rounded-sm font-mono text-10 transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      tone: {
        active: "text-success-vivid hover:text-fg",
        muted: "text-fg-muted hover:text-fg",
      },
    },
    defaultVariants: { tone: "muted" },
  }
);

export const bar = cva("flex h-[var(--player-bar-height)] flex-col justify-center @player:gap-1", {
  variants: {
    placement: {
      dock: "bg-player-dock border-primary-500/25 border-t px-2 backdrop-blur-md @player:px-5",
      header: "bg-transparent",
    },
  },
  defaultVariants: { placement: "dock" },
});

export const barTop = cva("flex w-full min-w-0 items-center gap-3 @player:gap-4.5");

export const barIdentity = cva("flex min-w-0 items-center gap-2 @player:gap-3", {
  variants: {
    placement: {
      dock: "flex-1 @player:basis-0 @player:grow",
      header: "",
    },
  },
  defaultVariants: { placement: "dock" },
});

export const barCoverButton = cva(
  "focus-visible:ring-primary-500 flex shrink-0 cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:outline-none"
);

export const barTextColumn = cva("flex min-w-0 flex-col gap-0.5");

export const barNameRow = cva("flex min-w-0 items-center gap-1.5");

export const barNameButton = cva(
  "focus-visible:ring-primary-500 flex min-w-0 items-center rounded-lg text-left focus-visible:ring-2 focus-visible:outline-none @player:cursor-default"
);

export const barTitle = cva("text-fg block min-w-0 truncate text-13 leading-tight font-semibold");

export const barDeviceLine = cva("flex items-center gap-1 truncate text-11 leading-tight", {
  variants: {
    remote: {
      true: "text-secondary-400",
      false: "hidden",
    },
  },
  defaultVariants: { remote: false },
});

export const barSubtitle = cva("text-fg-muted block min-w-0 truncate text-11 leading-tight");

export const barSubtitleRow = cva("flex min-w-0 items-center gap-1.5");

export const barSourceChip = cva(
  "bg-warning-vivid/15 text-warning-vivid inline-flex shrink-0 items-center rounded-full px-1.5 text-10 leading-4 font-semibold"
);

export const sourceList = cva("flex flex-col gap-1.5");

export const sourceCard = cva(
  "focus-visible:ring-primary-500 flex min-h-11 w-full items-center gap-3 rounded-lg border px-2.5 py-2 text-left transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      active: {
        true: "border-primary-500/50 bg-primary-500/10",
        false: "border-fg-muted/20 hover:bg-fg/5 cursor-pointer",
      },
    },
    defaultVariants: { active: false },
  }
);

export const sourceMark = cva("flex size-7 shrink-0 items-center justify-center rounded-full", {
  variants: {
    local: {
      true: "bg-fg/10 text-fg",
      false: "",
    },
  },
  defaultVariants: { local: false },
});

export const sourceCardLabel = cva("text-fg min-w-0 flex-1 truncate text-sm font-medium");

export const sourceCardDetail = cva("text-fg-muted shrink-0 text-xs tabular-nums");

export const sourceCardCheck = cva("text-primary-400 size-4 shrink-0", {
  variants: {
    active: {
      true: "",
      false: "invisible",
    },
  },
  defaultVariants: { active: false },
});

export const pickerFill = cva("text-fg-muted flex cursor-pointer items-center gap-2 text-sm");

export const barSubtitleAlbum = cva("hidden @player:inline");

export const barTransport = cva("order-3 flex shrink-0 items-center gap-1 @player:order-none @player:gap-3.5");

export const barProgress = cva("hidden w-full min-w-0 items-center gap-3 @player:flex");

export const barExtras = cva(
  "order-4 flex shrink-0 items-center gap-1 @player:order-none @player:basis-0 @player:grow @player:justify-end @player:gap-2.5"
);

export const moreBadge = cva("ring-surface-overlay absolute top-1 right-1 size-2 rounded-full ring-2", {
  variants: {
    tone: {
      remote: "bg-secondary-400",
      warning: "bg-warning-vivid animate-pulse a11y-mode:rotate-45 a11y-mode:rounded-xs",
      danger: "bg-destructive-vivid a11y-mode:rounded-none",
      notice: "bg-warning-vivid a11y-mode:rotate-45 a11y-mode:rounded-xs",
      private: "bg-primary-400",
      friends: "bg-accent-400",
      arrival: "bg-accent-400 animate-pulse",
    },
  },
});

export const moreTrigger = cva("relative", {
  variants: {
    layout: {
      narrow: "@player:hidden",
      wide: "hidden @player:grid",
      stage: "",
    },
  },
  defaultVariants: { layout: "narrow" },
});

export const moreTriggerIcon = cva("size-5");

export const moreMenuIcon = cva("size-4 shrink-0");

export const moreSheetTitle = cva("text-fg px-5 pt-4 pb-1 text-sm font-semibold");

export const moreSheetBody = cva("max-h-[70dvh] px-2 pb-2");

export const moreSheetList = cva("flex flex-col");

export const moreSheetLabel = cva("text-fg-muted px-3 pt-3 pb-1 font-mono text-10 tracking-caps uppercase");

export const moreSheetSeparator = cva("bg-fg/10 mx-3 my-1 h-px");

export const moreSheetRow = cva(
  "text-fg hover:bg-fg/5 focus-visible:bg-fg/5 flex min-h-12 w-full items-center gap-3 rounded-lg px-3 text-left text-sm outline-none disabled:pointer-events-none disabled:opacity-45"
);

export const moreSheetCheck = cva("text-primary-400 size-4 shrink-0", {
  variants: {
    checked: {
      true: "opacity-100",
      false: "opacity-0",
    },
  },
});

export const menuState = cva("ml-auto shrink-0 pl-3 text-11", {
  variants: {
    tone: {
      muted: "text-fg-muted",
      off: "text-fg-muted",
      on: "text-secondary-400",
      sending: "text-secondary-400",
      remote: "text-secondary-400",
      friends: "text-accent-400",
      retrying: "text-warning-vivid",
      failed: "text-destructive-vivid",
    },
  },
  defaultVariants: { tone: "muted" },
});

export const volumeGroup = cva("items-center gap-2", {
  variants: {
    size: {
      bar: "hidden @player-wide:flex",
      stage: "flex",
      drawer: "flex w-full",
    },
  },
  defaultVariants: { size: "bar" },
});

export const clock = cva("text-fg-muted shrink-0 font-mono tabular-nums", {
  variants: {
    size: {
      bar: "w-10 text-11",
      stage: "w-12 text-12",
    },
    align: {
      left: "text-left",
      right: "text-right",
    },
  },
  defaultVariants: { size: "bar", align: "left" },
});

export const iconButton = cva(
  "focus-visible:ring-primary-500 grid shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50",
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
  "bg-primary-500 text-primary-foreground focus-visible:ring-primary-400 relative grid shrink-0 place-items-center rounded-full transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60",
  {
    variants: {
      size: {
        bar: "size-11 @player:size-9.5",
        stage: "size-14 @player:size-15",
        ring: "size-15 shadow-neon-primary",
        masthead: "size-9",
      },
    },
    defaultVariants: { size: "bar" },
  }
);

export const playCluster = cva("relative grid shrink-0 place-items-center");

export const stopBadge = cva(
  "bg-primary-500 text-primary-foreground hover:bg-primary-400 ring-surface focus-visible:outline-primary-400 absolute grid place-items-center rounded-full ring-[3px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:hover:bg-primary-500",
  {
    variants: {
      size: {
        bar: "-right-1.5 -bottom-1.5 size-5 a11y-mode:-right-2.5 a11y-mode:-bottom-2.5 a11y-mode:size-6",
        stage: "-right-1 -bottom-1 size-6.5",
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
      card: "size-11 rounded-md",
      bar: "size-10 rounded-md @player:size-12.5",
      masthead: "size-9 rounded-lg",
      stage: "size-[min(60vw,24vh,16.75rem)] rounded-xl @player:size-[min(60vw,32vh,16.75rem)]",
      fluid: "size-[min(100cqw,100cqh,16.75rem)] rounded-xl",
      sideways: "size-16 rounded-lg",
      immersive: "size-[max(6rem,min(100dvh_-_35rem,30vw,25rem))] rounded-2xl",
      immersiveSide: "size-[max(6rem,min(100dvh_-_35rem,22vw,20rem))] rounded-2xl",
      immersiveIdle: "size-[max(6rem,min(100dvh_-_20rem,40vw,34rem))] rounded-3xl",
    },
  },
  defaultVariants: { tone: "primary", size: "bar" },
});

export const coverDepth = cva("shadow-float ring-fg/8 ring-1");

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
      row: "text-9",
      card: "text-10",
      bar: "text-10",
      masthead: "text-10",
      stage: "text-[1.625rem]",
      fluid: "text-[1.625rem]",
      sideways: "text-14",
      immersive: "text-[2rem]",
      immersiveSide: "text-[1.625rem]",
      immersiveIdle: "text-[2.75rem]",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveTrack = cva("relative min-w-0 flex-1 cursor-pointer touch-none", {
  variants: {
    size: {
      bar: "h-9",
      stage: "h-9 sm:h-14.5",
    },
  },
  defaultVariants: { size: "bar" },
});

export const waveCanvas = cva("pointer-events-none block size-full");

export const barMobileProgress = cva("bg-fg-muted/20 absolute inset-x-0 -bottom-0.5 h-0.5 @player:hidden");

export const barMobileProgressFill = cva("player-bar-progress bg-primary-400 h-0.5");

export const masthead = cva("flex h-full min-w-0 flex-1 items-center gap-3");

export const mastheadIdentity = cva(
  "focus-visible:ring-primary-500 flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2"
);

export const mastheadText = cva("flex min-w-0 flex-col");

export const mastheadTitle = cva("text-fg truncate text-sm font-semibold");

export const mastheadArtist = cva("text-fg-muted truncate text-xs");

export const mastheadNext = cva("text-fg");

export const headerProgress = cva(
  "bg-fg-muted/20 pointer-events-none absolute inset-x-0 bottom-0 h-0.5 sm:-bottom-0.5"
);

export const volumeTrack = cva("flex h-4 cursor-pointer items-center touch-none", {
  variants: {
    size: {
      bar: "w-40",
      stage: "w-44",
      drawer: "min-w-0 flex-1",
    },
  },
  defaultVariants: { size: "bar" },
});

export const volumeRail = cva("bg-fg-muted/30 relative h-1 w-full rounded-full");

export const volumeFill = cva("player-volume-fill bg-fg h-1 rounded-full");

export const volumeHead = cva("player-volume-head bg-fg absolute -top-[3px] -ml-1.25 size-2.5 rounded-full");

export const panelAnchor = cva("player-metrics pointer-events-auto fixed z-70", {
  variants: {
    width: {
      devices: "sm:w-[306px]",
      settings: "sm:w-100",
      room: "sm:w-[340px]",
      queue: "",
    },
    chain: {
      true: "player-metrics-chain",
      false: "",
    },
    anchored: {
      true: "inset-x-0 bottom-0 sm:inset-x-auto sm:top-[var(--player-anchor-top)] sm:bottom-[var(--player-anchor-bottom)] sm:left-[var(--player-anchor-left)] sm:max-h-[var(--player-anchor-height)]",
      false:
        "player-panel-anchor inset-x-0 bottom-0 sm:inset-x-auto sm:right-[var(--player-dock-gap)] sm:bottom-[calc(var(--player-bar-height)+var(--player-dock-gap))]",
      column:
        "player-panel-column inset-x-0 top-0 bottom-[calc(var(--player-dock-height)+var(--height-bottom-nav))] sm:inset-x-auto sm:right-[var(--player-dock-gap)] sm:bottom-[var(--player-dock-height)] sm:w-95",
    },
  },
  defaultVariants: { width: "devices", chain: false, anchored: false },
});

export const panelSurface = cva(
  "bg-surface-overlay border-fg/10 flex flex-col overflow-hidden rounded-t-2xl border pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-t-xl sm:pb-0",
  {
    variants: {
      edge: {
        bar: "border-b-0",
        header: "sm:rounded-xl sm:rounded-t-none sm:border-t-0 sm:shadow-float",
        floating: "sm:rounded-xl sm:shadow-float",
      },
      stretch: {
        true: "h-full",
        false: "",
      },
    },
    defaultVariants: { edge: "bar", stretch: false },
  }
);

export const deviceList = cva("flex flex-col gap-2.5 p-3.5");

export const deviceCaption = cva("text-fg-muted font-mono text-10 tracking-caps");

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

export const modeHint = cva("text-fg-muted shrink-0 font-mono text-10 tracking-caps uppercase");

export const settingsPanel = cva(
  "scrollbar-none flex max-h-[min(78vh,calc(100vh-var(--player-dock-height)-1rem))] flex-col gap-3 overflow-y-auto px-3 pb-3"
);

export const settingsModalOverlay = cva("z-70");

export const settingsModal = cva(
  "player-metrics bg-surface-overlay border-fg/10 fixed inset-x-0 bottom-0 z-70 flex max-h-[85dvh] flex-col overflow-hidden rounded-t-2xl border border-b-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-2xl focus:outline-none sm:inset-x-auto sm:top-1/2 sm:bottom-auto sm:left-1/2 sm:max-h-[min(85dvh,52rem)] sm:w-[min(26rem,calc(100vw-2rem))] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl sm:border-b sm:pb-0"
);

export const settingsModalFrame = cva("flex min-h-0 flex-1 flex-col");

export const settingsModalBody = cva("scrollbar-none flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 pb-3");

export const settingsSection = cva(
  "border-fg-muted/25 bg-surface/40 flex flex-col gap-3 rounded-xl border px-3.5 py-3"
);

export const settingsSectionHeader = cva("flex min-h-8 items-center justify-between gap-3");

export const settingsSectionTitle = cva("text-fg font-mono text-11 tracking-caps");

export const settingsSectionBody = cva("border-fg-muted/15 flex flex-col gap-3.5 border-t pt-3.5");

export const settingsHint = cva("text-fg-muted text-11 leading-snug");

export const settingsSlider = cva("flex items-center gap-3");

export const settingsSliderLabel = cva("text-fg/80 w-[4.5rem] shrink-0 text-xs");

export const settingsSliderTrack = cva(
  "focus-visible:ring-primary-500 flex h-4 min-w-0 flex-1 cursor-pointer items-center rounded-md touch-none focus-visible:ring-2 focus-visible:outline-none aria-disabled:cursor-default aria-disabled:opacity-40"
);

export const settingsSliderValue = cva("text-fg w-16 shrink-0 text-right font-mono text-11 tabular-nums");

export const settingsPresetRow = cva("flex items-center gap-2");

export const settingsPresetInput = cva("min-w-0 flex-1");

export const equalizerHeaderGroup = cva("flex items-center gap-2.5");

export const equalizerPresetTrigger = cva("gap-1.5");

export const equalizerBands = cva("flex items-start gap-1");

export const equalizerScale = cva(
  "text-fg-muted flex h-35 shrink-0 flex-col justify-between pt-4.5 pr-1 text-right font-mono text-9 leading-none tabular-nums"
);

export const equalizerBand = cva("flex min-w-0 flex-1 flex-col items-center gap-1.5", {
  variants: {
    disabled: {
      true: "opacity-40",
      false: "",
    },
  },
  defaultVariants: { disabled: false },
});

export const equalizerBandValue = cva("h-3 font-mono text-10 leading-none tabular-nums", {
  variants: {
    active: {
      true: "text-primary-400",
      false: "text-fg-muted",
    },
  },
  defaultVariants: { active: false },
});

export const equalizerBandTrack = cva(
  "focus-visible:ring-primary-500 relative h-30.5 w-full cursor-pointer rounded-md touch-none focus-visible:ring-2 focus-visible:outline-none aria-disabled:cursor-default"
);

export const equalizerBandRail = cva("bg-fg-muted/25 absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded-full");

export const equalizerBandZero = cva("bg-fg-muted/40 absolute inset-x-1 top-1/2 h-px");

export const equalizerBandFill = cva(
  "player-eq-fill bg-primary-400/70 absolute left-1/2 w-1 -translate-x-1/2 rounded-full"
);

export const equalizerBandHead = cva(
  "player-eq-head bg-fg absolute left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-sm"
);

export const equalizerBandLabel = cva("text-fg-muted font-mono text-9 tracking-label");

export const equalizerFootnote = cva("text-fg-muted flex flex-col gap-1 font-mono text-10 tracking-wider");

export const queueHeader = cva("flex shrink-0 items-center justify-between gap-3 px-3.5 pt-3 pb-1");

export const queueTitle = cva("text-fg text-15 font-semibold");

export const queueHeaderActions = cva("flex items-center gap-1");

export const abovePlayerPanels = cva("z-80");

export const queueCaption = cva("text-fg-muted shrink-0 px-1 pt-2 pb-1 font-mono text-10 tracking-caps");

export const queueList = cva("scrollbar-none flex min-h-0 flex-1 flex-col overflow-y-auto px-2.5 pb-2");

export const queueSentinel = cva("h-px w-full shrink-0");

export const queueRow = cva("flex shrink-0 items-center gap-1 rounded-lg", {
  variants: {
    current: {
      true: "",
      false: "hover:bg-fg/6",
    },
  },
  defaultVariants: { current: false },
});

export const queueGrip = cva(
  "text-fg-muted/40 hover:text-fg-muted grid size-6 shrink-0 cursor-grab touch-none place-items-center active:cursor-grabbing"
);

export const queueRowText = cva(
  "focus-visible:ring-primary-500 flex min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-lg py-1.5 text-left focus-visible:ring-2 focus-visible:outline-none"
);

export const queueRowLines = cva("flex min-w-0 flex-1 flex-col");

export const queueRowTitle = cva("min-w-0 truncate text-13 leading-tight font-semibold", {
  variants: {
    current: {
      true: "text-primary-400",
      false: "text-fg",
    },
  },
  defaultVariants: { current: false },
});

export const queueRowArtist = cva("text-fg-muted min-w-0 truncate text-11 leading-tight");

export const queueEmpty = cva("text-fg-muted px-1 py-3 text-12");

export const miniRoot = cva("text-fg flex flex-col overflow-hidden", {
  variants: {
    placement: {
      window: "bg-surface h-screen w-screen",
      stage: "relative h-full w-full justify-evenly",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniHeader = cva("flex shrink-0 items-center", {
  variants: {
    placement: {
      window: "gap-3 px-3.5 pt-3 pb-1",
      stage: "gap-4",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniTextColumn = cva("flex min-w-0 flex-1 flex-col", {
  variants: {
    placement: {
      window: "",
      stage: "text-left",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniTitle = cva("text-fg truncate leading-tight font-semibold", {
  variants: {
    placement: {
      window: "text-13",
      stage: "text-xl",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniArtist = cva("text-fg-muted truncate leading-tight", {
  variants: {
    placement: {
      window: "text-11",
      stage: "text-15",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniTransport = cva("grid shrink-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center", {
  variants: {
    placement: {
      window: "gap-3.5 px-3.5 py-1",
      stage: "gap-7",
    },
  },
  defaultVariants: { placement: "window" },
});

export const transportSide = cva("", {
  variants: {
    layout: {
      inline: "contents",
      centred: "flex items-center gap-3.5",
      spread: "flex items-center gap-7",
    },
    at: {
      start: "",
      end: "",
    },
  },
  compoundVariants: [
    { layout: ["centred", "spread"], at: "start", class: "justify-end" },
    { layout: ["centred", "spread"], at: "end", class: "justify-start" },
  ],
});

export const miniProgress = cva("flex w-full min-w-0 shrink-0 items-center", {
  variants: {
    placement: {
      window: "gap-2.5 px-3.5",
      stage: "gap-3.5",
    },
  },
  defaultVariants: { placement: "window" },
});

export const miniChevronRow = cva("flex shrink-0 items-center justify-center");

export const miniExtras = cva("flex shrink-0 items-center justify-center gap-1 px-3.5 pb-1");

export const miniFooter = cva("shrink-0 px-3.5 pt-2 pb-3");

export const miniLibraryButton = cva(
  "bg-primary-500 text-primary-foreground focus-visible:ring-primary-400 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-2.5 text-13 font-semibold transition-transform hover:scale-[1.02] focus-visible:ring-2 focus-visible:outline-none"
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

export const deviceName = cva("text-fg min-w-0 flex-1 truncate text-13 font-semibold");

export const barDesktopExtras = cva("hidden shrink-0 items-center gap-2.5 @player:flex");

export const stage = cva("@container pointer-events-auto fixed inset-0 z-60 flex flex-col overflow-hidden");

export const stageBackdrop = cva("bg-surface/98 absolute inset-0 backdrop-blur-xl");

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
  "relative flex min-h-0 flex-1 flex-col overflow-hidden px-6 text-center md:px-11 md:text-left",
  {
    variants: {
      layout: {
        wide: "",
        compact: "pt-14",
        landscape: "pt-12 pb-4",
      },
    },
    defaultVariants: { layout: "wide" },
  }
);

export const stageMeta = cva("flex max-w-107.5 flex-col items-center gap-1.5 sm:gap-2.5 md:items-start");

export const stageTitle = cva(
  "text-fg line-clamp-2 text-[1.625rem] leading-tight font-bold tracking-tight sm:line-clamp-none sm:text-[2.125rem]"
);

export const stageArtist = cva("text-fg text-16");

export const stageAlbum = cva("text-fg-muted text-14");

export const stageChips = cva("mt-1 flex flex-wrap items-center gap-2", {
  variants: {
    align: {
      start: "justify-center md:justify-start",
      center: "justify-center",
    },
  },
  defaultVariants: { align: "start" },
});

export const immersiveArt = cva("pointer-events-none absolute inset-0 overflow-hidden");

export const immersiveArtImage = cva("scale-125 object-cover opacity-30 blur-3xl");

export const immersiveVeil = cva(
  "from-surface/40 via-surface/10 to-surface/70 pointer-events-none absolute inset-0 bg-linear-to-b"
);

export const immersiveHeaderDivider = cva("bg-fg/10 h-6 w-px");

export const immersiveMain = cva("relative flex min-h-0 flex-1 items-center justify-center gap-[5cqw] px-[6cqw] pb-6", {
  variants: {
    idle: {
      true: "cursor-none pt-6",
      false: "pt-20",
    },
  },
  defaultVariants: { idle: false },
});

export const immersiveFooterSlide = cva("shrink-0 overflow-hidden");

export const immersiveColumn = cva("flex min-w-0 flex-col items-center gap-5", {
  variants: {
    lyrics: {
      true: "w-[min(26rem,32cqw)] shrink-0",
      false: "w-full max-w-155",
    },
  },
  defaultVariants: { lyrics: false },
});

export const immersiveMeta = cva(
  "flex max-w-full flex-col items-center gap-2 text-center [&_h2]:transition-[font-size] [&_h2]:duration-500 [&_p]:transition-[font-size] [&_p]:duration-500",
  {
    variants: {
      grow: {
        true: "[&_h2]:text-[3.25rem] [&>p]:text-xl",
        false: "",
      },
    },
    defaultVariants: { grow: false },
  }
);

export const immersiveLyrics = cva("flex h-full min-h-0 max-w-205 min-w-0 flex-1 self-stretch");

export const immersiveQueue = cva("flex h-full min-h-0 max-w-155 min-w-0 flex-1 flex-col self-stretch");

export const immersiveQueueTitle = cva("text-fg text-2xl font-bold tracking-tight");

export const stageChip = cva("rounded-full border px-2.5 py-1 font-mono text-11 whitespace-nowrap", {
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

export const stageDeviceLine = cva("text-secondary-400 mt-0.5 flex items-center gap-1.5 text-12");

export const stageActions = cva("mt-1.5 flex items-center gap-4");

export const stageFooter = cva("relative flex shrink-0 flex-col px-5 sm:px-15", {
  variants: {
    layout: {
      wide: "gap-4 pt-4 pb-[max(1.75rem,env(safe-area-inset-bottom))]",
      compact: "gap-3 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))]",
    },
  },
  defaultVariants: { layout: "wide" },
});

export const stageCoverSlot = cva("flex min-h-0 w-full flex-1 items-center justify-center [container-type:size]");

export const stageDrawerFrame = cva("w-full overflow-hidden");

export const stageController = cva(
  "border-fg/10 bg-surface/40 from-primary-600/15 to-accent-600/15 shadow-glass @container flex flex-col rounded-3xl border bg-linear-to-br p-3.5"
);

export const stagePad = cva("player-stage-ring grid");

export const stageArea = cva("", {
  variants: {
    area: {
      actions: "[grid-area:actions]",
      info: "[grid-area:info] self-start justify-self-center",
      shuffle: "[grid-area:shuffle] self-end justify-self-center",
      more: "[grid-area:more] self-start justify-self-center",
      repeat: "[grid-area:repeat] self-end justify-self-center",
      volume: "[grid-area:volume]",
    },
  },
});

export const stageRing = cva(
  "bg-surface-sunken/70 ring-fg/8 shadow-well relative size-(--player-ring) rounded-full ring-1 ring-inset [grid-area:ring]"
);

export const stageRingSlot = cva("absolute", {
  variants: {
    at: {
      top: "top-1 left-1/2 -translate-x-1/2",
      bottom: "bottom-1 left-1/2 -translate-x-1/2",
      left: "top-1/2 left-1 -translate-y-1/2",
      right: "top-1/2 right-1 -translate-y-1/2",
      center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
    },
  },
});

export const stageCorner = cva(
  "focus-visible:ring-primary-500 relative grid size-(--player-ring-side) shrink-0 place-items-center rounded-full border transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      active: {
        true: "border-primary-500/45 bg-primary-500/15 text-primary-400",
        false: "border-fg/10 bg-surface-overlay/70 text-fg-muted hover:text-fg",
      },
    },
    defaultVariants: { active: false },
  }
);

export const stageTray = cva("border-fg-muted/15 flex items-center justify-between", {
  variants: {
    edge: {
      top: "mb-3 border-b pb-3",
      bottom: "mt-3 border-t pt-3",
    },
  },
});

export const stageScrubRow = cva("flex items-center gap-3.5");

export const stageTransport = cva("flex items-center justify-center gap-7 sm:gap-7.5");

export const srOnly = cva("sr-only");

export function progressVars(percent: number): CssVars {
  return { "--player-progress": `${percent.toFixed(2)}%` };
}

export function anchorVars(point: PanelAnchorPoint | null): CssVars | undefined {
  if (point === null) return undefined;
  const height = point.room;
  return {
    "--player-anchor-top": point.below ? `${point.top}px` : "auto",
    "--player-anchor-bottom": point.below ? "auto" : `${point.bottom}px`,
    "--player-anchor-left": `${point.left}px`,
    "--player-anchor-height": `${Math.max(0, height)}px`,
  };
}

export function volumeVars(percent: number): CssVars {
  return { "--player-volume": `${Math.round(percent)}%` };
}

export function bandVars(fractionFromTop: number): CssVars {
  const head = fractionFromTop * 100;
  const above = head <= 50;
  return {
    "--player-eq-head-top": `${head.toFixed(2)}%`,
    "--player-eq-fill-top": above ? `${head.toFixed(2)}%` : "50%",
    "--player-eq-fill-height": `${Math.abs(50 - head).toFixed(2)}%`,
  };
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
      locked: {
        true: "cursor-not-allowed opacity-50",
        false: "",
      },
    },
    defaultVariants: { state: "off", size: "bar", locked: false },
  }
);

export const privateSessionStatus = cva(
  "focus-visible:ring-primary-500 text-primary-400 hover:bg-fg/8 grid shrink-0 place-items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      size: {
        bar: "size-7",
        stage: "size-9",
      },
    },
    defaultVariants: { size: "bar" },
  }
);

export const scrobbleSign = cva("bg-surface absolute right-0 bottom-0 hidden size-3 rounded-full p-px a11y-mode:block");

export const scrobbleDot = cva("absolute right-0.5 bottom-0.5 size-1.5 rounded-full a11y-mode:hidden", {
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
      compact: "flex-col gap-3 text-center",
    },
  },
});

export const stageVolume = cva("flex justify-center");

export const lyricsPane = cva("flex h-full min-h-0 w-full flex-col gap-3 pb-3", {
  variants: {
    fit: {
      stage: "max-w-225 items-center",
      column: "relative items-stretch",
    },
  },
  defaultVariants: { fit: "stage" },
});

export const lyricsScroll = cva("player-lyrics-fade scrollbar-none min-h-0 w-full flex-1 overflow-y-auto px-2");

export const lyricsBody = cva("flex flex-col", {
  variants: {
    fit: {
      stage: "items-center gap-2.5 py-[32vh] text-center sm:gap-3 sm:py-[42vh]",
      column: "items-start gap-3 py-[34vh] text-left",
    },
  },
  defaultVariants: { fit: "stage" },
});

export const lyricsAutoScroll = cva(
  "border-fg/10 bg-surface-overlay/60 focus-visible:ring-primary-500 inline-flex h-8 items-center gap-2 rounded-full border py-0 pr-3 pl-1.5 text-12 transition-colors focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      on: {
        true: "text-fg",
        false: "text-fg-muted hover:text-fg",
      },
    },
    defaultVariants: { on: true },
  }
);

export const lyricsAutoScrollSwitch = cva(
  "border-fg/10 relative h-4.5 w-7.5 rounded-full border transition-colors after:absolute after:top-0.5 after:left-0.5 after:size-3 after:rounded-full after:transition-transform",
  {
    variants: {
      on: {
        true: "bg-primary-500/45 after:bg-fg after:translate-x-3",
        false: "bg-surface-sunken after:bg-fg-muted",
      },
    },
    defaultVariants: { on: true },
  }
);

export const lyricsReturn = cva(
  "border-primary-500/50 bg-surface-overlay/90 text-fg focus-visible:ring-primary-500 absolute bottom-4 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border px-3.5 py-2 text-13 shadow-lg focus-visible:ring-2 focus-visible:outline-none"
);

export const lyricsLine = cva(
  "player-lyric-line focus-visible:ring-primary-500 w-full rounded-lg px-2 leading-tight font-bold tracking-tight transition-all duration-500 ease-out focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      fit: {
        stage: "text-[1.5625rem] sm:text-[2.875rem]",
        column: "origin-left text-left text-[2.5rem] text-balance",
      },
      state: {
        active: "text-fg scale-[1.02]",
        resting: "text-fg/30 hover:text-fg/60",
        plain: "text-fg/70",
      },
      depth: {
        near: "",
        mid: "blur-2xs",
        far: "blur-2xs opacity-70",
      },
      seekable: {
        true: "cursor-pointer",
        false: "",
      },
    },
    defaultVariants: { state: "plain", depth: "near", seekable: false, fit: "stage" },
  }
);

export const lyricsEmpty = cva("text-fg-muted py-10 text-center text-base");

export const lyricsUntimed = cva("text-fg-muted text-center text-xs");

export const listeningAvatars = cva(
  "focus-visible:ring-primary-500 pointer-events-auto flex items-center rounded-full transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:outline-none",
  {
    variants: {
      placement: {
        dock: "player-metrics absolute right-3 bottom-[calc(var(--player-bar-height)+var(--height-bottom-nav)-0.875rem)] sm:right-[calc(var(--player-dock-gap)+1.25rem)] sm:bottom-[calc(var(--player-dock-height)-1rem)]",
        stage: "",
      },
      chain: {
        true: "player-metrics-chain",
        false: "",
      },
    },
    defaultVariants: { placement: "dock", chain: false },
  }
);

export const listeningAvatar = cva("relative -ml-2.5 rounded-full shadow-lg first:ml-0");

export const listeningMore = cva(
  "bg-surface-overlay/80 text-fg absolute inset-0 grid place-items-center rounded-full text-11 font-semibold"
);

export const roomSurface = cva("max-h-[inherit]");

export const roomBody = cva(
  "scrollbar-none flex max-h-[60dvh] min-h-0 flex-col gap-2 overflow-y-auto px-3.5 pt-1 pb-3.5 [&>*]:shrink-0"
);

export const roomCard = cva("border-accent-400/45 flex items-center gap-3 rounded-xl border px-3 py-2.5");

export const roomRow = cva("flex items-center gap-3 px-1 py-1");

export const roomText = cva("flex min-w-0 flex-1 flex-col");

export const roomName = cva("text-fg flex min-w-0 items-center gap-1.5 text-13 font-semibold");

export const roomTrack = cva("text-fg truncate text-12");

export const roomDetail = cva("text-fg-muted truncate text-11");

export const roomAgo = cva("text-fg-muted shrink-0 text-11");

export const roomEmpty = cva("text-fg-muted px-1 py-3 text-13");

export const roomLiveDot = cva("bg-accent-400 size-1.5 shrink-0 animate-pulse rounded-full");

export const listeningNotice = cva(
  "bg-surface-overlay border-fg/10 focus-visible:ring-primary-500 flex w-full items-center gap-3 rounded-xl border p-3 text-left shadow-2xl focus-visible:ring-2 focus-visible:outline-none"
);

export const listeningNoticeLead = cva("text-fg-muted truncate text-11");
