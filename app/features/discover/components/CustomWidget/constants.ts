import {
  Activity,
  Album,
  ArrowDown,
  ArrowUp,
  AudioLines,
  AudioWaveform,
  Bookmark,
  Cake,
  CalendarClock,
  CalendarDays,
  ChartColumn,
  Clock,
  Coffee,
  Compass,
  Crown,
  Disc3,
  Download,
  Drum,
  Ear,
  Flame,
  Gem,
  Globe,
  Guitar,
  Headphones,
  Heart,
  History,
  Hourglass,
  House,
  Leaf,
  Library,
  ListMusic,
  type LucideIcon,
  Map as MapIcon,
  Medal,
  MicVocal,
  Minus,
  Moon,
  Mountain,
  Music,
  Music2,
  Orbit,
  PackageCheck,
  PartyPopper,
  Piano,
  Radio,
  Repeat,
  Rocket,
  RotateCcw,
  Shuffle,
  Snowflake,
  Sparkles,
  Star,
  Sun,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
  User,
  Users,
  WandSparkles,
  Waves,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type { WidgetBlock, WidgetIcon, WidgetShape } from "@hooks/api/queries/widgets/types";

import { BarsBlock } from "../WidgetCharts/BarsBlock";
import { CompareBlock } from "../WidgetCharts/CompareBlock";
import { HeatmapBlock } from "../WidgetCharts/HeatmapBlock";
import { ShareBlock } from "../WidgetCharts/ShareBlock";
import { SparklineBlock } from "../WidgetCharts/SparklineBlock";
import { StatTrendBlock } from "../WidgetCharts/StatTrendBlock";
import { YearCalendarBlock } from "../WidgetCharts/YearCalendarBlock";
import { StoryBlock } from "../WidgetStory/StoryBlock";
import { CalendarBlock } from "./CalendarBlock";
import { CardsBlock } from "./CardsBlock";
import { FeedBlock } from "./FeedBlock";
import { HeroBlock } from "./HeroBlock";
import { LeaderBlock } from "./LeaderBlock";
import { ListBlock } from "./ListBlock";
import { MixBlock } from "./MixBlock";
import { MosaicBlock } from "./MosaicBlock";
import { PostersBlock } from "./PostersBlock";
import { RailBlock } from "./RailBlock";
import { RankingMovesBlock } from "./RankingMovesBlock";
import { SpotlightBlock } from "./SpotlightBlock";
import { StatBlock } from "./StatBlock";
import { StatsBlock } from "./StatsBlock";
import { TilesBlock } from "./TilesBlock";
import type { MoveDirection, WidgetBlockProps } from "./types";

export const BLOCK_COMPONENTS: Record<WidgetBlock, ComponentType<WidgetBlockProps>> = {
  list: ListBlock,
  cards: CardsBlock,
  rail: RailBlock,
  stat: StatBlock,
  stats: StatsBlock,
  leader: LeaderBlock,
  feed: FeedBlock,
  calendar: CalendarBlock,
  bars: BarsBlock,
  sparkline: SparklineBlock,
  heatmap: HeatmapBlock,
  statTrend: StatTrendBlock,
  rankingMoves: RankingMovesBlock,
  compare: CompareBlock,
  mosaic: MosaicBlock,
  yearCalendar: YearCalendarBlock,
  share: ShareBlock,
  story: StoryBlock,
  mix: MixBlock,
  posters: PostersBlock,
  spotlight: SpotlightBlock,
  tiles: TilesBlock,
  hero: HeroBlock,
};

export const FRAMELESS_BLOCKS: ReadonlySet<WidgetBlock> = new Set(["mix", "hero"]);

export const SET_POSTER_COLUMNS = { S: 1, M: 2, L: 6 } as const;

export const SET_POSTER_LIMITS = { S: 2, M: 4, L: 6 } as const;

export const MINUTE_MS = 60_000;

export const BLOCK_LIMITS = {
  list: { S: 5, M: 8, L: 12 },
  feed: { S: 3, M: 6, L: 10 },
  calendar: { S: 4, M: 6, L: 10 },
  leader: { S: 0, M: 6, L: 8 },
  stats: { S: 1, M: 3, L: 4 },
  rail: { S: 50, M: 50, L: 50 },
  rankingMoves: { S: 5, M: 8, L: 12 },
  mosaic: { S: 4, M: 10, L: 20 },
  spotlight: { S: 2, M: 4, L: 4 },
  cards: { S: 4, M: 6, L: 12 },
} as const satisfies Record<string, Record<BoardSize, number>>;

export const CARD_COLUMNS: Record<BoardSize, number> = { S: 1, M: 2, L: 4 };

export const MIX_COVER_LIMIT = 4;

export const SERIES_STAT_LIMIT = 4;

export const SUGGESTED_BLOCKS: Record<WidgetShape, readonly WidgetBlock[]> = {
  ranked: ["list", "leader", "cards", "rail", "posters", "mix", "spotlight", "hero", "mosaic", "tiles", "rankingMoves"],
  single: ["stat", "statTrend"],
  series: ["bars", "sparkline", "yearCalendar", "statTrend"],
  matrix: ["heatmap", "bars"],
  buckets: ["share", "bars", "tiles", "compare"],
  facts: ["story"],
  feedItems: ["feed", "list", "cards", "rail"],
};

export const MOSAIC_COLUMNS: Record<BoardSize, number> = { S: 2, M: 5, L: 10 };

export const MOSAIC_ROWS = 2;

export const MOVE_ICONS: Record<MoveDirection, LucideIcon> = {
  up: ArrowUp,
  down: ArrowDown,
  same: Minus,
  new: Sparkles,
};

export const MONTH_KEY_LENGTH = 7;

export const MATRIX_WEEKDAYS = 7;

export const MATRIX_HOURS = 24;

export const HOUR_LABEL_YEAR = 2024;

export const WIDGET_ICONS: Record<WidgetIcon, LucideIcon> = {
  sparkles: Sparkles,
  flame: Flame,
  trophy: Trophy,
  heart: Heart,
  star: Star,
  gem: Gem,
  zap: Zap,
  music: Music,
  "music-2": Music2,
  "disc-3": Disc3,
  album: Album,
  headphones: Headphones,
  radio: Radio,
  "mic-vocal": MicVocal,
  guitar: Guitar,
  piano: Piano,
  drum: Drum,
  "list-music": ListMusic,
  library: Library,
  history: History,
  "rotate-ccw": RotateCcw,
  repeat: Repeat,
  shuffle: Shuffle,
  clock: Clock,
  "calendar-days": CalendarDays,
  "calendar-clock": CalendarClock,
  cake: Cake,
  sun: Sun,
  moon: Moon,
  sunrise: Sunrise,
  coffee: Coffee,
  "party-popper": PartyPopper,
  rocket: Rocket,
  compass: Compass,
  map: MapIcon,
  globe: Globe,
  orbit: Orbit,
  "trending-up": TrendingUp,
  "chart-column": ChartColumn,
  activity: Activity,
  users: Users,
  user: User,
  house: House,
  leaf: Leaf,
  mountain: Mountain,
  waves: Waves,
  snowflake: Snowflake,
  crown: Crown,
  medal: Medal,
  target: Target,
  hourglass: Hourglass,
  bookmark: Bookmark,
  "wand-sparkles": WandSparkles,
  "package-check": PackageCheck,
  download: Download,
  ear: Ear,
  "audio-lines": AudioLines,
  "audio-waveform": AudioWaveform,
};

export const FALLBACK_WIDGET_ICON: LucideIcon = Sparkles;
