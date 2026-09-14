import type { inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "@api/__generated__/types";

export type OrganisePreview = inferRouterOutputs<AppRouter>["library"]["organise"]["preview"];
export type NamingCurrent = inferRouterOutputs<AppRouter>["library"]["naming"]["current"];
export type NamingToken = NamingCurrent["tokens"][number];
export type OrganiseStatus = inferRouterOutputs<AppRouter>["library"]["organise"]["status"];
export type MoveClass = OrganisePreview["movesByClass"][number]["moveClass"];
export type NamingPreview = inferRouterOutputs<AppRouter>["library"]["naming"]["preview"];

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

export type MoveFilter = "all" | MoveClass;

export type TemplateProblem = Extract<NamingPreview, { outcome: "invalid" }>["problem"];

export interface TokensModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: string;
  edited: string;
  tokens: readonly NamingToken[];
  problem: TemplateProblem | null;
  onTemplateChange: (next: string) => void;
}

export interface MoveProgress {
  percent: number;
  processed: number;
  total: number;
  remaining: string | null;
}

export interface PreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: string;
}
