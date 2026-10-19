import type { ParseKeys } from "i18next";

import type { FilterType } from "@api/__generated__/types";
import { FILTER_TABS } from "@features/search/components/Results/constants";

export const OMNI_GOTO_HINTS: Partial<Record<string, ParseKeys<"components">>> = {
  "/requests": "header.omni.goRequests",
  "/library": "header.omni.goLibrary",
};

export const OMNI_SCOPES: readonly FilterType[] = FILTER_TABS.map((tab) => tab.value);

export const OMNI_RESULT_LIMIT = 6;

export const OMNI_DEBOUNCE_MS = 250;

export const OMNI_LIST_ID = "omni-search-options";
