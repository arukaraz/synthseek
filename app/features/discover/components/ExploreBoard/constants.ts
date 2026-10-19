import type { ParseKeys } from "i18next";
import {
  Activity,
  CalendarClock,
  Download,
  Grid3X3,
  Library,
  Radio,
  RotateCcw,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import type { BoardItem, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";

import { ArtistSpotlight } from "../ArtistSpotlight/ArtistSpotlight";
import { CategoriesGrid } from "../CategoriesGrid/CategoriesGrid";
import { DiscoveryMixes } from "../DiscoveryMixes/DiscoveryMixes";
import { HISTORY_MIXES } from "../HistoryMixes/constants";
import { DeepCuts } from "../HistoryMixes/DeepCuts";
import { ForgottenFavorites } from "../HistoryMixes/ForgottenFavorites";
import { OnRepeat } from "../HistoryMixes/OnRepeat";
import { RepeatRewind } from "../HistoryMixes/RepeatRewind";
import { JumpBackIn } from "../JumpBackIn/JumpBackIn";
import { LastYear } from "../LastYear/LastYear";
import { RecentRequests } from "../RecentRequests/RecentRequests";
import { RecentScrobbles } from "../RecentScrobbles/RecentScrobbles";
import { Stations } from "../Stations/Stations";
import { TopTracks } from "../TopTracks/TopTracks";
import { TrendingHero } from "../TrendingHero/TrendingHero";
import type { BoardCategory, BoardDevice, BoardSpan, BoardWidgetDefinition } from "./types";

export const BOARD_WIDE_QUERY = "(min-width: 64rem)";

export const BOARD_SCHEMA_VERSION = 1;

export const BOARD_COLUMNS: Record<BoardDevice, number> = { wide: 12, narrow: 4 };

export const BOARD_ROW_PX = 72;

export const BOARD_GAP_PX = 16;

export const FAMILY_SPANS: Record<BoardDevice, Record<BoardSize, BoardSpan>> = {
  wide: {
    S: { cols: 3, rows: 2 },
    C: { cols: 3, rows: 7 },
    M: { cols: 6, rows: 4 },
    "M+": { cols: 6, rows: 7 },
    L: { cols: 12, rows: 4 },
    XL: { cols: 12, rows: 7 },
  },
  narrow: {
    S: { cols: 2, rows: 2 },
    C: { cols: 2, rows: 5 },
    M: { cols: 4, rows: 4 },
    "M+": { cols: 4, rows: 7 },
    L: { cols: 4, rows: 5 },
    XL: { cols: 4, rows: 7 },
  },
};

export const BOARD_CATEGORY_ORDER: readonly BoardCategory[] = ["now", "history", "discover", "library"];

export const BOARD_CATEGORY_KEYS: Record<
  BoardCategory,
  { title: ParseKeys<"discover">; description: ParseKeys<"discover"> }
> = {
  now: { title: "board.categories.now.title", description: "board.categories.now.description" },
  history: { title: "board.categories.history.title", description: "board.categories.history.description" },
  discover: { title: "board.categories.discover.title", description: "board.categories.discover.description" },
  library: { title: "board.categories.library.title", description: "board.categories.library.description" },
};

export const BOARD_SIZE_LABEL_KEYS: Record<BoardSize, ParseKeys<"discover">> = {
  S: "board.sizes.S",
  C: "board.sizes.C",
  M: "board.sizes.M",
  "M+": "board.sizes.MPlus",
  L: "board.sizes.L",
  XL: "board.sizes.XL",
};

export const BOARD_SIZE_NAME_KEYS: Record<BoardSize, ParseKeys<"discover">> = {
  S: "board.sizeNames.S",
  C: "board.sizeNames.C",
  M: "board.sizeNames.M",
  "M+": "board.sizeNames.MPlus",
  L: "board.sizeNames.L",
  XL: "board.sizeNames.XL",
};

export const BOARD_WIDGET_ORDER: readonly BoardWidgetKey[] = [
  "trending",
  "jumpBackIn",
  "stations",
  "onRepeat",
  "rewind",
  "deepCuts",
  "forgottenFavorites",
  "lastYear",
  "topTracks",
  "scrobbles",
  "mixes",
  "artistsNext",
  "genres",
  "requests",
];

export const BOARD_WIDGETS: Record<BoardWidgetKey, BoardWidgetDefinition> = {
  trending: {
    component: TrendingHero,
    category: "now",
    icon: Zap,
    titleKey: "trendingHero.badge",
    descriptionKey: "board.widgets.trending",
    sizes: ["M", "L", "XL"],
    defaultSize: "L",
  },
  topTracks: {
    component: TopTracks,
    category: "history",
    icon: Trophy,
    titleKey: "topTracks.title",
    descriptionKey: "board.widgets.topTracks",
    sizes: ["M", "M+"],
    defaultSize: "M+",
    narrowSizes: { M: "M+" },
  },
  scrobbles: {
    component: RecentScrobbles,
    category: "history",
    icon: Activity,
    titleKey: "recentScrobbles.title",
    descriptionKey: "board.widgets.scrobbles",
    sizes: ["M", "L"],
    defaultSize: "L",
    narrowSizes: { L: "M" },
  },
  mixes: {
    component: DiscoveryMixes,
    category: "discover",
    icon: Library,
    titleKey: "mixes.title",
    descriptionKey: "board.widgets.mixes",
    sizes: ["L", "XL"],
    defaultSize: "XL",
  },
  artistsNext: {
    component: ArtistSpotlight,
    category: "discover",
    icon: Users,
    titleKey: "artistSpotlight.title",
    descriptionKey: "board.widgets.artistsNext",
    sizes: ["L", "XL"],
    defaultSize: "XL",
  },
  genres: {
    component: CategoriesGrid,
    category: "discover",
    icon: Grid3X3,
    titleKey: "categories.grid.title",
    descriptionKey: "board.widgets.genres",
    sizes: ["M+", "XL"],
    defaultSize: "XL",
    narrowSizes: { XL: "M+" },
  },
  requests: {
    component: RecentRequests,
    category: "library",
    icon: Download,
    titleKey: "recentRequests.title",
    descriptionKey: "board.widgets.requests",
    sizes: ["M", "L"],
    defaultSize: "L",
    narrowSizes: { L: "M" },
  },
  onRepeat: {
    component: OnRepeat,
    category: "history",
    icon: HISTORY_MIXES.onRepeat.icon,
    titleKey: HISTORY_MIXES.onRepeat.titleKey,
    descriptionKey: "board.widgets.onRepeat",
    sizes: ["C", "M"],
    defaultSize: "C",
  },
  rewind: {
    component: RepeatRewind,
    category: "history",
    icon: HISTORY_MIXES.rewind.icon,
    titleKey: HISTORY_MIXES.rewind.titleKey,
    descriptionKey: "board.widgets.rewind",
    sizes: ["C", "M"],
    defaultSize: "C",
  },
  deepCuts: {
    component: DeepCuts,
    category: "history",
    icon: HISTORY_MIXES.deepCuts.icon,
    titleKey: HISTORY_MIXES.deepCuts.titleKey,
    descriptionKey: "board.widgets.deepCuts",
    sizes: ["C", "M"],
    defaultSize: "C",
  },
  forgottenFavorites: {
    component: ForgottenFavorites,
    category: "history",
    icon: HISTORY_MIXES.forgottenFavorites.icon,
    titleKey: HISTORY_MIXES.forgottenFavorites.titleKey,
    descriptionKey: "board.widgets.forgottenFavorites",
    sizes: ["C", "M"],
    defaultSize: "C",
  },
  jumpBackIn: {
    component: JumpBackIn,
    category: "now",
    icon: RotateCcw,
    titleKey: "jumpBackIn.title",
    descriptionKey: "board.widgets.jumpBackIn",
    sizes: ["M", "L"],
    defaultSize: "L",
    narrowSizes: { L: "M" },
  },
  lastYear: {
    component: LastYear,
    category: "history",
    icon: CalendarClock,
    titleKey: "lastYear.title",
    descriptionKey: "board.widgets.lastYear",
    sizes: ["M", "L"],
    defaultSize: "M",
  },
  stations: {
    component: Stations,
    category: "now",
    icon: Radio,
    titleKey: "stations.heading",
    descriptionKey: "board.widgets.stations",
    sizes: ["M", "L"],
    defaultSize: "L",
    narrowSizes: { L: "M" },
  },
};

export const DEFAULT_BOARD: readonly BoardItem[] = [
  { id: "trending", widget: "trending", size: "L" },
  { id: "jump-back-in", widget: "jumpBackIn", size: "L" },
  { id: "on-repeat", widget: "onRepeat", size: "C" },
  { id: "rewind", widget: "rewind", size: "C" },
  { id: "deep-cuts", widget: "deepCuts", size: "C" },
  { id: "forgotten-favorites", widget: "forgottenFavorites", size: "C" },
  { id: "mixes", widget: "mixes", size: "XL" },
  { id: "top-tracks", widget: "topTracks", size: "M+" },
  { id: "genres", widget: "genres", size: "M+" },
  { id: "stations", widget: "stations", size: "L" },
  { id: "artists-next", widget: "artistsNext", size: "XL" },
  { id: "last-year", widget: "lastYear", size: "M" },
  { id: "requests", widget: "requests", size: "M" },
  { id: "scrobbles", widget: "scrobbles", size: "L" },
];
