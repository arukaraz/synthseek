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

import type { BoardItem, BoardSize, BoardWidgetKey } from "@hooks/api/queries/board/types";

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

export const BOARD_SCHEMA_VERSION = 1;

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
  continueListening: {
    component: ContinueListening,
    category: "now",
    icon: PlayCircle,
    titleKey: "continueListening.title",
    descriptionKey: "board.widgets.continueListening",
    sizes: ["M", "L"],
    defaultSize: "L",
  },
  rarities: {
    component: Rarities,
    category: "history",
    icon: Gem,
    titleKey: "rarities.title",
    descriptionKey: "board.widgets.rarities",
    sizes: ["M", "L"],
    defaultSize: "M",
  },
  orbit: {
    component: Orbit,
    category: "discover",
    icon: OrbitIcon,
    titleKey: "orbit.title",
    descriptionKey: "board.widgets.orbit",
    sizes: ["M", "XL"],
    defaultSize: "XL",
  },
  charts: {
    component: Charts,
    category: "discover",
    icon: Flame,
    titleKey: "charts.title",
    descriptionKey: "board.widgets.charts",
    sizes: ["L", "XL"],
    defaultSize: "XL",
  },
  loved: {
    component: LovedNotHere,
    category: "discover",
    icon: Heart,
    titleKey: "loved.title",
    descriptionKey: "board.widgets.loved",
    sizes: ["M", "L"],
    defaultSize: "M",
  },
  newInLibrary: {
    component: NewInLibrary,
    category: "library",
    icon: ListPlus,
    titleKey: "newInLibrary.title",
    descriptionKey: "board.widgets.newInLibrary",
    sizes: ["M", "L"],
    defaultSize: "M",
  },
  gaps: {
    component: Gaps,
    category: "library",
    icon: Disc3,
    titleKey: "gaps.title",
    descriptionKey: "board.widgets.gaps",
    sizes: ["M", "L"],
    defaultSize: "L",
    narrowSizes: { L: "M" },
  },
  anniversaries: {
    component: Anniversaries,
    category: "library",
    icon: Cake,
    titleKey: "anniversaries.title",
    descriptionKey: "board.widgets.anniversaries",
    sizes: ["M"],
    defaultSize: "M",
  },
  landed: {
    component: Landed,
    category: "library",
    icon: PackageCheck,
    titleKey: "landed.title",
    descriptionKey: "board.widgets.landed",
    sizes: ["M", "L"],
    defaultSize: "M",
  },
  serverPlaylists: {
    component: ServerPlaylists,
    category: "library",
    icon: MonitorPlay,
    titleKey: "serverPlaylists.title",
    descriptionKey: "board.widgets.serverPlaylists",
    sizes: ["M", "L"],
    defaultSize: "L",
  },
};

export const DEFAULT_BOARD: readonly BoardItem[] = [
  { id: "trending", widget: "trending", size: "L" },
  { id: "continue-listening", widget: "continueListening", size: "L" },
  { id: "jump-back-in", widget: "jumpBackIn", size: "L" },
  { id: "on-repeat", widget: "onRepeat", size: "C" },
  { id: "rewind", widget: "rewind", size: "C" },
  { id: "deep-cuts", widget: "deepCuts", size: "C" },
  { id: "forgotten-favorites", widget: "forgottenFavorites", size: "C" },
  { id: "mixes", widget: "mixes", size: "XL" },
  { id: "top-tracks", widget: "topTracks", size: "M+" },
  { id: "genres", widget: "genres", size: "M+" },
  { id: "artists-next", widget: "artistsNext", size: "XL" },
  { id: "stations", widget: "stations", size: "L" },
  { id: "last-year", widget: "lastYear", size: "M" },
  { id: "rarities", widget: "rarities", size: "M" },
  { id: "charts", widget: "charts", size: "XL" },
  { id: "loved", widget: "loved", size: "M" },
  { id: "new-in-library", widget: "newInLibrary", size: "M" },
  { id: "gaps", widget: "gaps", size: "L" },
  { id: "orbit", widget: "orbit", size: "XL" },
  { id: "requests", widget: "requests", size: "M" },
  { id: "landed", widget: "landed", size: "M" },
  { id: "server-playlists", widget: "serverPlaylists", size: "L" },
  { id: "scrobbles", widget: "scrobbles", size: "M" },
  { id: "anniversaries", widget: "anniversaries", size: "M" },
];
