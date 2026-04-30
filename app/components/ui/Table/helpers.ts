import type { SortState } from "./types";

export function cycleSortDirection(
  current: SortState | undefined,
  nextField: string,
  defaultDirection: SortState["direction"] = "desc"
): SortState {
  if (current?.field === nextField) {
    return { field: nextField, direction: current.direction === "asc" ? "desc" : "asc" };
  }
  return { field: nextField, direction: defaultDirection };
}
