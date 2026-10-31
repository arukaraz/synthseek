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
  MonitorPlay,
  Orbit as OrbitIcon,
  PackageCheck,
  PlayCircle,
  Radio,
  RotateCcw,
  Trophy,
  Users,
  Zap,
} from "lucide-react";

import type { BoardHeight } from "@components/BoardGrid";
import type { BoardSize, BoardWidgetKey, BuiltinBoardItem } from "@hooks/api/queries/board/types";
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

export const BOARD_SCHEMA_VERSION = 3;

export const SPACER_ID = "spacer";

export const SPACER_DEFAULT_SIZE: BoardSize = "S";

export const SPACER_DEFAULT_ROWS = 4;

export const SPACER_MIN_ROWS = 1;

export const SPACER_MAX_ROWS = 7;

export const EDIT_PASSTHROUGH_SELECTOR = "[data-info-tooltip]";

export const BOARD_CATEGORY_ORDER: readonly BoardCategory[] = ["now", "history", "discover", "library"];

export const BOARD_SIZE_ORDER: readonly BoardSize[] = ["S", "M", "L"];

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
};

export const BOARD_SIZE_NAME_KEYS: Record<BoardSize, ParseKeys<"discover">> = {
  S: "board.sizeNames.S",
  M: "board.sizeNames.M",
  L: "board.sizeNames.L",
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

const HISTORY_MIX_SIZES: Record<BoardSize, BoardHeight> = { S: "tall", M: "regular", L: "short" };

export const BOARD_WIDGETS: Record<BoardWidgetKey, BoardWidgetDefinition> = {
  trending: {
    component: TrendingHero,
    category: "now",
    icon: Zap,
    titleKey: "trendingHero.badge",
    descriptionKey: "board.widgets.trending",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  topTracks: {
    component: TopTracks,
    category: "history",
    icon: Trophy,
    titleKey: "topTracks.title",
    descriptionKey: "board.widgets.topTracks",
    sizes: { S: "regular", M: "tall", L: "regular" },
    defaultSize: "M",
  },
  scrobbles: {
    component: RecentScrobbles,
    category: "history",
    icon: Activity,
    titleKey: "recentScrobbles.title",
    descriptionKey: "board.widgets.scrobbles",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  mixes: {
    component: DiscoveryMixes,
    category: "discover",
    icon: Library,
    titleKey: "mixes.title",
    descriptionKey: "board.widgets.mixes",
    sizes: { S: "regular", M: "tall", L: "regular" },
    defaultSize: "L",
  },
  artistsNext: {
    component: ArtistSpotlight,
    category: "discover",
    icon: Users,
    titleKey: "artistSpotlight.title",
    descriptionKey: "board.widgets.artistsNext",
    sizes: { S: "regular", M: "tall", L: "tall" },
    defaultSize: "L",
  },
  genres: {
    component: CategoriesGrid,
    category: "discover",
    icon: Grid3X3,
    titleKey: "categories.grid.title",
    descriptionKey: "board.widgets.genres",
    sizes: { S: "tall", M: "tall", L: "tall" },
    defaultSize: "L",
  },
  requests: {
    component: RecentRequests,
    category: "library",
    icon: Download,
    titleKey: "recentRequests.title",
    descriptionKey: "board.widgets.requests",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
  onRepeat: {
    component: OnRepeat,
    category: "history",
    icon: HISTORY_MIXES.onRepeat.icon,
    titleKey: HISTORY_MIXES.onRepeat.titleKey,
    descriptionKey: "board.widgets.onRepeat",
    sizes: HISTORY_MIX_SIZES,
    defaultSize: "S",
  },
  rewind: {
    component: RepeatRewind,
    category: "history",
    icon: HISTORY_MIXES.rewind.icon,
    titleKey: HISTORY_MIXES.rewind.titleKey,
    descriptionKey: "board.widgets.rewind",
    sizes: HISTORY_MIX_SIZES,
    defaultSize: "S",
  },
  deepCuts: {
    component: DeepCuts,
    category: "history",
    icon: HISTORY_MIXES.deepCuts.icon,
    titleKey: HISTORY_MIXES.deepCuts.titleKey,
    descriptionKey: "board.widgets.deepCuts",
    sizes: HISTORY_MIX_SIZES,
    defaultSize: "S",
  },
  forgottenFavorites: {
    component: ForgottenFavorites,
    category: "history",
    icon: HISTORY_MIXES.forgottenFavorites.icon,
    titleKey: HISTORY_MIXES.forgottenFavorites.titleKey,
    descriptionKey: "board.widgets.forgottenFavorites",
    sizes: HISTORY_MIX_SIZES,
    defaultSize: "S",
  },
  jumpBackIn: {
    component: JumpBackIn,
    category: "now",
    icon: RotateCcw,
    titleKey: "jumpBackIn.title",
    descriptionKey: "board.widgets.jumpBackIn",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  lastYear: {
    component: LastYear,
    category: "history",
    icon: CalendarClock,
    titleKey: "lastYear.title",
    descriptionKey: "board.widgets.lastYear",
    sizes: { S: "tall", M: "tall", L: "regular" },
    defaultSize: "M",
  },
  stations: {
    component: Stations,
    category: "now",
    icon: Radio,
    titleKey: "stations.heading",
    descriptionKey: "board.widgets.stations",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  continueListening: {
    component: ContinueListening,
    category: "now",
    icon: PlayCircle,
    titleKey: "continueListening.title",
    descriptionKey: "board.widgets.continueListening",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  rarities: {
    component: Rarities,
    category: "history",
    icon: Gem,
    titleKey: "rarities.title",
    descriptionKey: "board.widgets.rarities",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
  orbit: {
    component: Orbit,
    category: "discover",
    icon: OrbitIcon,
    titleKey: "orbit.title",
    descriptionKey: "board.widgets.orbit",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "L",
  },
  charts: {
    component: Charts,
    category: "discover",
    icon: Flame,
    titleKey: "charts.title",
    descriptionKey: "board.widgets.charts",
    sizes: { S: "tall", M: "tall", L: "regular" },
    defaultSize: "M",
  },
  loved: {
    component: LovedNotHere,
    category: "discover",
    icon: Heart,
    titleKey: "loved.title",
    descriptionKey: "board.widgets.loved",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
  newInLibrary: {
    component: NewInLibrary,
    category: "library",
    icon: ListPlus,
    titleKey: "newInLibrary.title",
    descriptionKey: "board.widgets.newInLibrary",
    sizes: { S: "regular", M: "tall", L: "regular" },
    defaultSize: "M",
  },
  leaderboard: {
    component: LibraryLeaderboard,
    category: "library",
    icon: Library,
    titleKey: "leaderboard.title",
    descriptionKey: "board.widgets.leaderboard",
    sizes: { S: "regular", M: "tall", L: "tall" },
    defaultSize: "M",
  },
  gaps: {
    component: Gaps,
    category: "library",
    icon: Disc3,
    titleKey: "gaps.title",
    descriptionKey: "board.widgets.gaps",
    sizes: { S: "regular", M: "tall", L: "regular" },
    defaultSize: "M",
  },
  anniversaries: {
    component: Anniversaries,
    category: "library",
    icon: Cake,
    titleKey: "anniversaries.title",
    descriptionKey: "board.widgets.anniversaries",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
  landed: {
    component: Landed,
    category: "library",
    icon: PackageCheck,
    titleKey: "landed.title",
    descriptionKey: "board.widgets.landed",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
  serverPlaylists: {
    component: ServerPlaylists,
    category: "library",
    icon: MonitorPlay,
    titleKey: "serverPlaylists.title",
    descriptionKey: "board.widgets.serverPlaylists",
    sizes: { S: "regular", M: "regular", L: "regular" },
    defaultSize: "M",
  },
};

export const CUSTOM_BLOCK_HEIGHTS: Record<WidgetBlock, Record<BoardSize, BoardHeight>> = {
  list: { S: "regular", M: "regular", L: "regular" },
  cards: { S: "regular", M: "regular", L: "regular" },
  rail: { S: "regular", M: "regular", L: "regular" },
  stat: { S: "short", M: "short", L: "short" },
  stats: { S: "short", M: "short", L: "short" },
  leader: { S: "regular", M: "tall", L: "tall" },
  feed: { S: "regular", M: "regular", L: "tall" },
  calendar: { S: "regular", M: "regular", L: "tall" },
  bars: { S: "regular", M: "regular", L: "regular" },
  sparkline: { S: "short", M: "regular", L: "regular" },
  heatmap: { S: "regular", M: "regular", L: "regular" },
  statTrend: { S: "short", M: "short", L: "short" },
  rankingMoves: { S: "regular", M: "regular", L: "regular" },
  compare: { S: "regular", M: "regular", L: "tall" },
  mosaic: { S: "regular", M: "regular", L: "regular" },
  yearCalendar: { S: "short", M: "regular", L: "regular" },
  share: { S: "regular", M: "regular", L: "regular" },
  story: { S: "regular", M: "tall", L: "tall" },
  mix: { S: "tall", M: "regular", L: "short" },
  posters: { S: "regular", M: "regular", L: "regular" },
  spotlight: { S: "regular", M: "tall", L: "tall" },
  tiles: { S: "tall", M: "tall", L: "tall" },
  hero: { S: "regular", M: "regular", L: "regular" },
};

export const FALLBACK_BLOCK_HEIGHT: BoardHeight = "regular";

export const NARROW_TILE_SIZE: BoardSize = "M";

export const DEFAULT_BOARD: readonly BuiltinBoardItem[] = [
  { kind: "builtin", id: "trending", widget: "trending", size: "L" },
  { kind: "builtin", id: "continue-listening", widget: "continueListening", size: "L" },
  { kind: "builtin", id: "jump-back-in", widget: "jumpBackIn", size: "L" },
  { kind: "builtin", id: "on-repeat", widget: "onRepeat", size: "S" },
  { kind: "builtin", id: "rewind", widget: "rewind", size: "S" },
  { kind: "builtin", id: "deep-cuts", widget: "deepCuts", size: "S" },
  { kind: "builtin", id: "forgotten-favorites", widget: "forgottenFavorites", size: "S" },
  { kind: "builtin", id: "mixes", widget: "mixes", size: "L" },
  { kind: "builtin", id: "top-tracks", widget: "topTracks", size: "M" },
  { kind: "builtin", id: "charts", widget: "charts", size: "M" },
  { kind: "builtin", id: "genres", widget: "genres", size: "L" },
  { kind: "builtin", id: "artists-next", widget: "artistsNext", size: "L" },
  { kind: "builtin", id: "stations", widget: "stations", size: "L" },
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
  { kind: "builtin", id: "orbit", widget: "orbit", size: "L" },
  { kind: "builtin", id: "scrobbles", widget: "scrobbles", size: "L" },
];
