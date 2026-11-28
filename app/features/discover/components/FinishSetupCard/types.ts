import type { AppRouter } from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";

export type SetupPending = inferRouterOutputs<AppRouter>["settings"]["setup"]["pending"];

export type SetupPendingItem = SetupPending["items"][number];

export interface FinishSetupRowProps {
  item: SetupPendingItem;
}
