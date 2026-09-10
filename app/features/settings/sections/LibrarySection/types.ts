import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type OrganisePreview = inferRouterOutputs<AppRouter>["library"]["organise"]["preview"];
export type NamingCurrent = inferRouterOutputs<AppRouter>["library"]["naming"]["current"];
export type NamingToken = NamingCurrent["tokens"][number];
export type OrganiseStatus = inferRouterOutputs<AppRouter>["library"]["organise"]["status"];
export type MoveClass = OrganisePreview["movesByClass"][number]["moveClass"];

export interface GroupSelection {
  relocate: boolean;
  rename: boolean;
}

export interface RunOutcome {
  moved: number;
  companionsMoved: number;
  failed: number;
  companionsFailed: number;
  abandoned: number;
  failures: OrganiseStatus["failures"];
  listedFailures: number;
  duration: string;
}

export interface OrganiseGroupRowProps {
  moveClass: MoveClass;
  count: number;
  checked: boolean;
  disabled: boolean;
  onToggle: (next: boolean) => void;
}
