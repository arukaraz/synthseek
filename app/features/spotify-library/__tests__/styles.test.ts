import { describe, expect, it } from "vitest";

import {
  autoImportBadge,
  autoImportPopover,
  autoImportRow,
  autoImportRowLabel,
  autoImportRowSub,
  autoImportTitle,
  autoImportTrigger,
  bbStat,
  bbStatStrong,
  bottombar,
  bottombarButtons,
  bottombarLeft,
  bottombarRight,
  brandChip,
  brandIcon,
  bulkMenuItem,
  bulkTrigger,
  cfgRow,
  cfgRowDesc,
  cfgRowLabel,
  checkBox,
  connectPrompt,
  connectPromptBody,
  connectPromptIcon,
  connectPromptTitle,
  coverPlaceholder,
  coverThumb,
  detailAct,
  detailActions,
  detailBy,
  detailByDot,
  detailCoverImg,
  detailCoverPlaceholderLg,
  detailCoverRow,
  detailCrumb,
  detailEmpty,
  detailEmptyArt,
  detailEmptyBody,
  detailEmptyCard,
  detailEmptyCardLine,
  detailEmptyHint,
  detailEmptyHints,
  detailEmptyKbd,
  detailEmptyTitle,
  detailH2,
  detailHeartImg,
  detailHero,
  detailLoading,
  detailPane,
  detailPaneWrapper,
  detailSection,
  detailSectionTitle,
  detailSectionTitleLine,
  heartThumb,
  inlineAct,
  masterEmpty,
  masterScroll,
  metaGrid,
  metaKey,
  metaVal,
  metaValText,
  modalGrid,
  modalRoot,
  searchBox,
  searchInput,
  selChip,
  selChipDot,
  selChipNum,
  selDivider,
  split,
  stDot,
  stPill,
  syncDot,
  syncPill,
  table,
  tableCell,
  tableCellMono,
  tableCellMonoDim,
  tableCellName,
  tableHead,
  tableRow,
  toolbar,
  topbar,
  trackArtist,
  trackDur,
  trackList,
  trackMore,
  trackPos,
  trackRow,
  trackTitle,
  typeTag,
} from "../styles";

describe("layout shells", () => {
  it("modalRoot fills the viewport on mobile and centers as a sheet on desktop", () => {
    const result = modalRoot();
    expect(result).toContain("h-[100dvh]");
    expect(result).toContain("sm:max-w-[1380px]");
  });

  it("modalGrid uses a four-row template", () => {
    expect(modalGrid()).toContain("grid-rows-[auto_auto_1fr_auto]");
  });

  it("split stacks on mobile and rows on desktop", () => {
    expect(split()).toContain("flex-col");
    expect(split()).toContain("md:flex-row");
  });
});

describe("connect prompt", () => {
  it("centers the prompt content", () => {
    expect(connectPrompt()).toContain("justify-center");
  });

  it("tints the icon with the spotify green", () => {
    expect(connectPromptIcon()).toContain("text-[#1ed760]");
  });

  it("uses the foreground token for the title and a muted body", () => {
    expect(connectPromptTitle()).toContain("text-fg");
    expect(connectPromptBody()).toContain("text-fg/60");
  });
});

describe("chrome bars", () => {
  it("topbar and toolbar use bordered surfaces", () => {
    expect(topbar()).toContain("border-b");
    expect(toolbar()).toContain("border-b");
  });

  it("brandChip and brandIcon carry the spotify accent", () => {
    expect(brandChip()).toContain("text-fg");
    expect(brandIcon()).toContain("text-[#1ed760]");
    expect(brandIcon({ tone: "spotify" })).toContain("bg-[#1ed760]/15");
  });

  it("searchBox and searchInput focus on the primary token", () => {
    expect(searchBox()).toContain("flex-1");
    expect(searchInput()).toContain("focus:border-primary-500/40");
  });
});

describe("master scroll panes", () => {
  it("masterScroll hides on mobile only when requested", () => {
    expect(masterScroll({ hiddenOnMobile: true })).toContain("hidden");
    expect(masterScroll({ hiddenOnMobile: false })).toContain("flex");
  });

  it("detailPaneWrapper hides on mobile only when requested", () => {
    expect(detailPaneWrapper({ hiddenOnMobile: true })).toContain("hidden");
    expect(detailPaneWrapper({ hiddenOnMobile: false })).toContain("flex");
  });

  it("master and detail empty states are muted and centered", () => {
    expect(masterEmpty()).toContain("justify-center");
    expect(detailLoading()).toContain("justify-center");
  });
});

describe("table primitives", () => {
  it("table uses a fixed layout", () => {
    expect(table()).toContain("table-fixed");
  });

  it("tableHead sticks to the top", () => {
    expect(tableHead()).toContain("sticky");
  });

  it("tableRow flags selected and focused rows distinctly", () => {
    expect(tableRow({ selected: true })).toContain("bg-primary-500/[0.06]");
    expect(tableRow({ focused: true })).toContain("bg-primary-500/[0.14]");
    expect(tableRow({ selected: true, focused: true })).toContain("bg-primary-500/[0.14]");
    expect(tableRow({ selected: false, focused: false })).toContain("cursor-pointer");
  });

  it("table cells use foreground tints", () => {
    expect(tableCell()).toContain("text-fg/70");
    expect(tableCellName()).toContain("font-medium");
    expect(tableCellMono()).toContain("font-mono");
    expect(tableCellMonoDim()).toContain("text-fg/40");
  });

  it("cover thumbnails fall back to gradients", () => {
    expect(coverThumb()).toContain("rounded");
    expect(heartThumb()).toContain("text-rose-400");
    expect(coverPlaceholder()).toContain("bg-gradient-to-br");
  });
});

describe("type and status tags", () => {
  it("typeTag colors each content type by tone", () => {
    expect(typeTag({ tone: "playlist" })).toContain("text-primary-200");
    expect(typeTag({ tone: "album" })).toContain("text-cyan-300");
    expect(typeTag({ tone: "liked" })).toContain("text-rose-300");
  });

  it("status pill and dot reflect imported vs disabled", () => {
    expect(stPill({ tone: "imported" })).toContain("text-emerald-400");
    expect(stPill({ tone: "disabled" })).toContain("text-fg/50");
    expect(stDot({ tone: "imported" })).toContain("bg-emerald-400");
    expect(stDot({ tone: "disabled" })).toContain("bg-fg/40");
  });

  it("sync pill and dot toggle on the primary token", () => {
    expect(syncPill({ on: true })).toContain("text-primary-200");
    expect(syncPill({ on: false })).toContain("text-fg/40");
    expect(syncDot({ on: true })).toContain("bg-primary-300");
    expect(syncDot({ on: false })).toContain("bg-fg/40");
  });

  it("checkBox fills when on", () => {
    expect(checkBox({ on: true })).toContain("bg-gradient-to-br");
    expect(checkBox({ on: false })).toContain("border-fg/20");
  });
});

describe("detail pane", () => {
  it("detailPane scrolls within the surface", () => {
    expect(detailPane()).toContain("overflow-y-auto");
  });

  it("detail hero, crumb, and cover render", () => {
    expect(detailHero()).toContain("border-b");
    expect(detailCrumb()).toContain("uppercase");
    expect(detailCoverRow()).toContain("items-start");
    expect(detailCoverImg()).toContain("rounded-lg");
    expect(detailHeartImg()).toContain("text-rose-300");
    expect(detailCoverPlaceholderLg()).toContain("bg-gradient-to-br");
  });

  it("detail headings and byline use foreground tints", () => {
    expect(detailH2()).toContain("text-fg");
    expect(detailBy()).toContain("text-fg/60");
    expect(detailByDot()).toContain("bg-fg/30");
  });

  it("detail actions distinguish the primary action", () => {
    expect(detailActions()).toContain("flex");
    expect(detailAct({ primary: true })).toContain("bg-gradient-to-br");
    expect(detailAct({ primary: false })).toContain("text-fg/70");
  });

  it("detail sections use bordered blocks", () => {
    expect(detailSection()).toContain("border-b");
    expect(detailSectionTitle()).toContain("uppercase");
    expect(detailSectionTitleLine()).toContain("flex-1");
  });

  it("config rows render labels and descriptions", () => {
    expect(cfgRow()).toContain("justify-between");
    expect(cfgRowLabel()).toContain("text-fg");
    expect(cfgRowDesc()).toContain("text-fg/40");
  });

  it("meta grid renders keys and values", () => {
    expect(metaGrid()).toContain("grid");
    expect(metaKey()).toContain("text-fg/40");
    expect(metaVal()).toContain("font-mono");
    expect(metaValText()).toContain("text-fg");
  });

  it("track list renders rows", () => {
    expect(trackList()).toContain("flex-col");
    expect(trackRow()).toContain("grid");
    expect(trackPos()).toContain("font-mono");
    expect(trackTitle()).toContain("truncate");
    expect(trackArtist()).toContain("truncate");
    expect(trackDur()).toContain("text-right");
    expect(trackMore()).toContain("text-primary-300");
  });
});

describe("detail empty state", () => {
  it("renders the empty illustration and copy slots", () => {
    expect(detailEmpty()).toContain("justify-center");
    expect(detailEmptyArt()).toContain("inline-flex");
    expect(detailEmptyCard({ pos: "left" })).toContain("-rotate-[9deg]");
    expect(detailEmptyCard({ pos: "center" })).toContain("z-10");
    expect(detailEmptyCard({ pos: "right" })).toContain("rotate-[9deg]");
    expect(detailEmptyCardLine({ short: true })).toContain("w-3/5");
    expect(detailEmptyCardLine({ short: false })).toContain("bg-fg/10");
    expect(detailEmptyTitle()).toContain("font-semibold");
    expect(detailEmptyBody()).toContain("text-fg/60");
    expect(detailEmptyHints()).toContain("flex-wrap");
    expect(detailEmptyHint()).toContain("text-fg/40");
    expect(detailEmptyKbd()).toContain("font-mono");
  });
});

describe("bottombar", () => {
  it("lays out stats and actions", () => {
    expect(bottombar()).toContain("border-t");
    expect(bottombarLeft()).toContain("flex-wrap");
    expect(bottombarRight()).toContain("sm:ml-auto");
    expect(bottombarButtons()).toContain("items-center");
    expect(bbStat()).toContain("text-fg/60");
    expect(bbStatStrong()).toContain("font-semibold");
  });

  it("selection chips highlight the primary token", () => {
    expect(selChip()).toContain("border-primary-500/30");
    expect(selChipDot()).toContain("bg-primary-300");
    expect(selChipNum()).toContain("text-primary-300");
    expect(selDivider()).toContain("bg-fg/10");
  });

  it("inline actions flag the danger variant", () => {
    expect(inlineAct({ danger: true })).toContain("hover:text-rose-300");
    expect(inlineAct({ danger: false })).toContain("text-fg/60");
  });

  it("bulk and auto-import triggers reflect active state", () => {
    expect(bulkTrigger()).toContain("rounded-md");
    expect(bulkMenuItem()).toContain("text-xs");
    expect(autoImportTrigger({ active: true })).toContain("border-primary-500/30");
    expect(autoImportTrigger({ active: false })).toContain("text-fg/60");
    expect(autoImportBadge({ active: true })).toContain("text-primary-200");
    expect(autoImportBadge({ active: false })).toContain("text-fg/50");
    expect(autoImportPopover()).toContain("w-[280px]");
    expect(autoImportTitle()).toContain("uppercase");
    expect(autoImportRow()).toContain("justify-between");
    expect(autoImportRowLabel()).toContain("flex-col");
    expect(autoImportRowSub()).toContain("text-fg/45");
  });
});
