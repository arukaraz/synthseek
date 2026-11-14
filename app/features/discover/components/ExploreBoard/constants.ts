import type { ParseKeys } from "i18next";
import {
  Activity,
  Cake,
  CalendarClock,
  Disc3,
  Download,
  Flame,
  Gem,
  Grid3X3,
  Heart,
  Library,
  ListPlus,
  type LucideIcon,
  Monitor,
  MonitorPlay,
  Orbit as OrbitIcon,
  PackageCheck,
  PlayCircle,
  Radio,
  RotateCcw,
  Smartphone,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import type { BoardDevice } from "@components/BoardGrid";
import type {
  BoardList,
  BoardRowHeight,
  BoardSize,
  BoardWidgetKey,
  BuiltinBoardItem,
} from "@hooks/api/queries/board/types";
import type { WidgetBlock } from "@hooks/api/queries/widgets/types";

import { Anniversaries } from "../Anniversaries/Anniversaries";
import { ArtistSpotlight } from "../ArtistSpotlight/ArtistSpotlight";
import { CategoriesGrid } from "../CategoriesGrid/CategoriesGrid";
import { Charts } from "../Charts/Charts";
import { ContinueListening } from "../ContinueListening/ContinueListening";
import { DiscoveryMixes } from "../DiscoveryMixes/DiscoveryMixes";
import { Gaps } from "../Gaps/Gaps";
import { HISTORY_MIXES } from "../HistoryMixes/constants";
import { DeepCuts } from "../HistoryMixes/DeepCuts";
import { ForgottenFavorites } from "../HistoryMixes/ForgottenFavorites";
import { OnRepeat } from "../HistoryMixes/OnRepeat";
import { RepeatRewind } from "../HistoryMixes/RepeatRewind";
import { JumpBackIn } from "../JumpBackIn/JumpBackIn";
import { Landed } from "../Landed/Landed";
import { LibraryLeaderboard } from "../LibraryLeaderboard";
import { LastYear } from "../LastYear/LastYear";
import { LovedNotHere } from "../LovedNotHere/LovedNotHere";
import { NewInLibrary } from "../NewInLibrary/NewInLibrary";
import { Orbit } from "../Orbit/Orbit";
import { Rarities } from "../Rarities/Rarities";
import { RecentRequests } from "../RecentRequests/RecentRequests";
import { RecentScrobbles } from "../RecentScrobbles/RecentScrobbles";
import { ServerPlaylists } from "../ServerPlaylists/ServerPlaylists";
import { Stations } from "../Stations/Stations";
import { TopTracks } from "../TopTracks/TopTracks";
import { TrendingHero } from "../TrendingHero/TrendingHero";
import type { BoardCategory, BoardWidgetDefinition } from "./types";

export const BOARD_SCHEMA_VERSION = 5;

export const SPACER_ID = "spacer";

export const SPACER_DEFAULT_SIZE: BoardSize = "S";

export const SPACER_DEFAULT_ROWS = 4;

export const SPACER_MIN_ROWS = 1;

export const SPACER_MAX_ROWS = 7;

export const BOARD_MAX_ITEMS = 48;

export const EDIT_PASSTHROUGH_SELECTOR = "[data-info-tooltip]";

export const BOARD_CATEGORY_ORDER: readonly BoardCategory[] = ["now", "history", "discover", "library"];

export const BOARD_SIZE_ORDER: readonly BoardSize[] = ["S", "M", "L", "XL"];

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
  M: "board.sizes.M",
  L: "board.sizes.L",
  XL: "board.sizes.XL",
};

export const BOARD_SIZE_NAME_KEYS: Record<BoardSize, ParseKeys<"discover">> = {
  S: "board.sizeNames.S",
  M: "board.sizeNames.M",
  L: "board.sizeNames.L",
  XL: "board.sizeNames.XL",
};

export const BOARD_WIDGET_ORDER: readonly BoardWidgetKey[] = [
  "trending",
  "continueListening",
  "jumpBackIn",
  "stations",
  "onRepeat",
  "rewind",
  "deepCuts",
  "forgottenFavorites",
  "lastYear",
  "topTracks",
  "scrobbles",
  "rarities",
  "mixes",
  "artistsNext",
  "orbit",
  "charts",
  "loved",
  "genres",
  "newInLibrary",
  "leaderboard",
  "gaps",
  "anniversaries",
  "requests",
  "landed",
  "serverPlaylists",
];

export const BOARD_WIDGETS: Record<BoardWidgetKey, BoardWidgetDefinition> = {
  trending: {
    component: TrendingHero,
    category: "now",
    icon: Zap,
    titleKey: "trendingHero.badge",
    descriptionKey: "board.widgets.trending",
    defaultSize: "XL",
  },
  topTracks: {
    component: TopTracks,
    category: "history",
    icon: Trophy,
    titleKey: "topTracks.title",
    descriptionKey: "board.widgets.topTracks",
    defaultSize: "M",
  },
  scrobbles: {
    component: RecentScrobbles,
    category: "history",
    icon: Activity,
    titleKey: "recentScrobbles.title",
    descriptionKey: "board.widgets.scrobbles",
    defaultSize: "XL",
  },
  mixes: {
    component: DiscoveryMixes,
    category: "discover",
    icon: Library,
    titleKey: "mixes.title",
    descriptionKey: "board.widgets.mixes",
    defaultSize: "XL",
  },
  artistsNext: {
    component: ArtistSpotlight,
    category: "discover",
    icon: Users,
    titleKey: "artistSpotlight.title",
    descriptionKey: "board.widgets.artistsNext",
    defaultSize: "XL",
  },
  genres: {
    component: CategoriesGrid,
    category: "discover",
    icon: Grid3X3,
    titleKey: "categories.grid.title",
    descriptionKey: "board.widgets.genres",
    defaultSize: "XL",
  },
  requests: {
    component: RecentRequests,
    category: "library",
    icon: Download,
    titleKey: "recentRequests.title",
    descriptionKey: "board.widgets.requests",
    defaultSize: "M",
  },
  onRepeat: {
    component: OnRepeat,
    category: "history",
    icon: HISTORY_MIXES.onRepeat.icon,
    titleKey: HISTORY_MIXES.onRepeat.titleKey,
    descriptionKey: "board.widgets.onRepeat",
    defaultSize: "S",
    lockedTo: "S",
  },
  rewind: {
    component: RepeatRewind,
    category: "history",
    icon: HISTORY_MIXES.rewind.icon,
    titleKey: HISTORY_MIXES.rewind.titleKey,
    descriptionKey: "board.widgets.rewind",
    defaultSize: "S",
    lockedTo: "S",
  },
  deepCuts: {
    component: DeepCuts,
    category: "history",
    icon: HISTORY_MIXES.deepCuts.icon,
    titleKey: HISTORY_MIXES.deepCuts.titleKey,
    descriptionKey: "board.widgets.deepCuts",
    defaultSize: "S",
    lockedTo: "S",
  },
  forgottenFavorites: {
    component: ForgottenFavorites,
    category: "history",
    icon: HISTORY_MIXES.forgottenFavorites.icon,
    titleKey: HISTORY_MIXES.forgottenFavorites.titleKey,
    descriptionKey: "board.widgets.forgottenFavorites",
    defaultSize: "S",
    lockedTo: "S",
  },
  jumpBackIn: {
    component: JumpBackIn,
    category: "now",
    icon: RotateCcw,
    titleKey: "jumpBackIn.title",
    descriptionKey: "board.widgets.jumpBackIn",
    defaultSize: "XL",
  },
  lastYear: {
    component: LastYear,
    category: "history",
    icon: CalendarClock,
    titleKey: "lastYear.title",
    descriptionKey: "board.widgets.lastYear",
    defaultSize: "M",
  },
  stations: {
    component: Stations,
    category: "now",
    icon: Radio,
    titleKey: "stations.heading",
    descriptionKey: "board.widgets.stations",
    defaultSize: "XL",
  },
  continueListening: {
    component: ContinueListening,
    category: "now",
    icon: PlayCircle,
    titleKey: "continueListening.title",
    descriptionKey: "board.widgets.continueListening",
    defaultSize: "XL",
  },
  rarities: {
    component: Rarities,
    category: "history",
    icon: Gem,
    titleKey: "rarities.title",
    descriptionKey: "board.widgets.rarities",
    defaultSize: "M",
  },
  orbit: {
    component: Orbit,
    category: "discover",
    icon: OrbitIcon,
    titleKey: "orbit.title",
    descriptionKey: "board.widgets.orbit",
    defaultSize: "XL",
  },
  charts: {
    component: Charts,
    category: "discover",
    icon: Flame,
    titleKey: "charts.title",
    descriptionKey: "board.widgets.charts",
    defaultSize: "M",
  },
  loved: {
    component: LovedNotHere,
    category: "discover",
    icon: Heart,
    titleKey: "loved.title",
    descriptionKey: "board.widgets.loved",
    defaultSize: "M",
  },
  newInLibrary: {
    component: NewInLibrary,
    category: "library",
    icon: ListPlus,
    titleKey: "newInLibrary.title",
    descriptionKey: "board.widgets.newInLibrary",
    defaultSize: "M",
  },
  leaderboard: {
    component: LibraryLeaderboard,
    category: "library",
    icon: Library,
    titleKey: "leaderboard.title",
    descriptionKey: "board.widgets.leaderboard",
    defaultSize: "M",
  },
  gaps: {
    component: Gaps,
    category: "library",
    icon: Disc3,
    titleKey: "gaps.title",
    descriptionKey: "board.widgets.gaps",
    defaultSize: "M",
  },
  anniversaries: {
    component: Anniversaries,
    category: "library",
    icon: Cake,
    titleKey: "anniversaries.title",
    descriptionKey: "board.widgets.anniversaries",
    defaultSize: "M",
  },
  landed: {
    component: Landed,
    category: "library",
    icon: PackageCheck,
    titleKey: "landed.title",
    descriptionKey: "board.widgets.landed",
    defaultSize: "M",
  },
  serverPlaylists: {
    component: ServerPlaylists,
    category: "library",
    icon: MonitorPlay,
    titleKey: "serverPlaylists.title",
    descriptionKey: "board.widgets.serverPlaylists",
    defaultSize: "M",
  },
};

export const CUSTOM_BLOCK_LOCKS: Partial<Record<WidgetBlock, BoardSize>> = { mix: "S" };

export const CUSTOM_BLOCK_ROW_HEIGHTS: Partial<Record<WidgetBlock, BoardRowHeight>> = {
  stat: "short",
  stats: "short",
  statTrend: "short",
};

export const BOARD_ROW_FRAME_HEAD = "2rem";

export const BOARD_ROW_HEIGHT_ORDER: readonly BoardRowHeight[] = ["short", "regular", "tall"];

export const BOARD_ROW_HEIGHT_KEYS: Record<BoardRowHeight, ParseKeys<"discover">> = {
  short: "board.row.heights.short",
  regular: "board.row.heights.regular",
  tall: "board.row.heights.tall",
};

export const MOBILE_COPY_SIZE: BoardSize = "M";

export const BOARD_LISTS: readonly BoardList[] = ["items", "mobile"];

export const BOARD_SETTINGS_HREF = "/settings/appearance/board";

export const BOARD_LIST_OF: Record<BoardDevice, BoardList> = { wide: "items", narrow: "mobile" };

export const BOARD_DEVICE_OF: Record<BoardList, BoardDevice> = { items: "wide", mobile: "narrow" };

export const BOARD_LIST_KEYS = {
  items: "widgets:board.layouts.items",
  mobile: "widgets:board.layouts.mobile",
} as const;

export const BOARD_LIST_ICONS: Record<BoardList, LucideIcon> = { items: Monitor, mobile: Smartphone };

export const DEFAULT_BOARD: readonly BuiltinBoardItem[] = [
  { kind: "builtin", id: "trending", widget: "trending", size: "XL" },
  { kind: "builtin", id: "continue-listening", widget: "continueListening", size: "XL" },
  { kind: "builtin", id: "jump-back-in", widget: "jumpBackIn", size: "XL" },
  { kind: "builtin", id: "on-repeat", widget: "onRepeat", size: "S" },
  { kind: "builtin", id: "rewind", widget: "rewind", size: "S" },
  { kind: "builtin", id: "deep-cuts", widget: "deepCuts", size: "S" },
  { kind: "builtin", id: "forgotten-favorites", widget: "forgottenFavorites", size: "S" },
  { kind: "builtin", id: "mixes", widget: "mixes", size: "XL" },
  { kind: "builtin", id: "top-tracks", widget: "topTracks", size: "M" },
  { kind: "builtin", id: "charts", widget: "charts", size: "M" },
  { kind: "builtin", id: "genres", widget: "genres", size: "XL" },
  { kind: "builtin", id: "artists-next", widget: "artistsNext", size: "XL" },
  { kind: "builtin", id: "stations", widget: "stations", size: "XL" },
  { kind: "builtin", id: "last-year", widget: "lastYear", size: "M" },
  { kind: "builtin", id: "new-in-library", widget: "newInLibrary", size: "M" },
  { kind: "builtin", id: "rarities", widget: "rarities", size: "M" },
  { kind: "builtin", id: "loved", widget: "loved", size: "M" },
  { kind: "builtin", id: "leaderboard", widget: "leaderboard", size: "M" },
  { kind: "builtin", id: "gaps", widget: "gaps", size: "M" },
  { kind: "builtin", id: "anniversaries", widget: "anniversaries", size: "M" },
  { kind: "builtin", id: "requests", widget: "requests", size: "M" },
  { kind: "builtin", id: "landed", widget: "landed", size: "M" },
  { kind: "builtin", id: "server-playlists", widget: "serverPlaylists", size: "M" },
  { kind: "builtin", id: "orbit", widget: "orbit", size: "XL" },
  { kind: "builtin", id: "scrobbles", widget: "scrobbles", size: "XL" },
];
