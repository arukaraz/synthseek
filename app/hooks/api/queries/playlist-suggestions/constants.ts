export const SUGGESTIONS_CACHE_MS = 30 * 60 * 1000;

export const SUGGESTION_SEED_KEY = "playlistSuggestionSeed";

export const SUGGESTION_GONE_KEY = "playlistSuggestionGone";

export const SUGGESTION_SEED_SPAN = 0x100000000;

export const SUGGESTION_BARREN_PAGES = 3;

export const NO_SUGGESTION_IDS: readonly string[] = [];

export const NOTHING_GONE: ReadonlySet<string> = new Set();
