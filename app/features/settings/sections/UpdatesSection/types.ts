import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@api/__generated__/types";
import type { ChangelogEntry } from "@features/settings/components/PatchNotes";

type RouterOutputs = inferRouterOutputs<AppRouter>;

export type UpdateCheckResult = RouterOutputs["updates"]["check"];

export type EntryVariant = "latest" | "new" | "current" | "past";

export interface TimelineEntryProps {
  entry: ChangelogEntry;
  variant: EntryVariant;
}
