import type { BoardSize } from "@hooks/api/queries/board/types";

export const STORY_BACKDROP_COVERS = 15;

export const MINUTES_PER_HOUR = 60;

export const STORY_ROWS: Record<BoardSize, number> = { S: 0, M: 3, L: 5 };

export const STORY_SHOWS_COVER: Record<BoardSize, boolean> = { S: false, M: false, L: true };

export const STORY_SHOWS_DOTS: Record<BoardSize, boolean> = { S: false, M: true, L: true };
