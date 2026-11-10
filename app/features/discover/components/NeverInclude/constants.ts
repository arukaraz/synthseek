import type { SetVeto } from "@hooks/api/queries/widgets/types";

export const EMPTY_VETO: SetVeto = { artists: [], tracks: [], noTaste: [] };

export const VETO_MENU_LIMIT = 30;

export const VETO_SEARCH_DEBOUNCE_MS = 250;
