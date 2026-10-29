import {
  CalendarDays,
  Clock,
  Disc3,
  Flame,
  Gem,
  Headphones,
  Heart,
  History,
  Library,
  ListMusic,
  type LucideIcon,
  MicVocal,
  Music,
  Radio,
  RotateCcw,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import type { ComponentType } from "react";

import type { BoardSize } from "@hooks/api/queries/board/types";
import type { WidgetBlock } from "@hooks/api/queries/widgets/types";

import { CalendarBlock } from "./CalendarBlock";
import { CardsBlock } from "./CardsBlock";
import { FeedBlock } from "./FeedBlock";
import { LeaderBlock } from "./LeaderBlock";
import { ListBlock } from "./ListBlock";
import { RailBlock } from "./RailBlock";
import { StatBlock } from "./StatBlock";
import { StatsBlock } from "./StatsBlock";
import type { WidgetBlockProps } from "./types";

export const BLOCK_COMPONENTS: Partial<Record<WidgetBlock, ComponentType<WidgetBlockProps>>> = {
  list: ListBlock,
  cards: CardsBlock,
  rail: RailBlock,
  stat: StatBlock,
  stats: StatsBlock,
  leader: LeaderBlock,
  feed: FeedBlock,
  calendar: CalendarBlock,
};

export const BLOCK_LIMITS = {
  list: { S: 5, M: 8, L: 12 },
  feed: { S: 3, M: 6, L: 10 },
  calendar: { S: 4, M: 6, L: 10 },
  leader: { S: 0, M: 6, L: 8 },
  stats: { S: 1, M: 3, L: 4 },
  rail: { S: 2, M: 50, L: 50 },
} as const satisfies Record<string, Record<BoardSize, number>>;

export const WIDGET_ICONS: ReadonlyMap<string, LucideIcon> = new Map([
  ["calendar-days", CalendarDays],
  ["clock", Clock],
  ["disc-3", Disc3],
  ["flame", Flame],
  ["gem", Gem],
  ["headphones", Headphones],
  ["heart", Heart],
  ["history", History],
  ["library", Library],
  ["list-music", ListMusic],
  ["mic-vocal", MicVocal],
  ["music", Music],
  ["radio", Radio],
  ["rotate-ccw", RotateCcw],
  ["sparkles", Sparkles],
  ["star", Star],
  ["trending-up", TrendingUp],
  ["trophy", Trophy],
  ["users", Users],
  ["zap", Zap],
]);

export const FALLBACK_WIDGET_ICON: LucideIcon = Sparkles;
