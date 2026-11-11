import { ContentType } from "@api/__generated__/types";

export const VALID_FILTERS = ["all", ...ContentType.options] as const;

export const MAX_RESULTS_DISPLAY = 12;

export const FILTER_TRANSITION_MS = 300;
