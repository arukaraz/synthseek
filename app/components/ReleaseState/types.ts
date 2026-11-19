import type { ParseKeys } from "i18next";
import type { LucideIcon } from "lucide-react";

import type { FollowReleaseState } from "@hooks/api/queries/artist-follow/types";

export type ReleaseAction = "none" | "request" | "viewRequest" | "play";

export interface ReleaseStateInfo {
  labelKey: ParseKeys<"follows">;
  glyph: LucideIcon;
  action: ReleaseAction;
  dashed: boolean;
}

export interface ReleaseStateProps {
  state: FollowReleaseState;
  autoRequest: boolean;
  showLabel?: boolean;
  className?: string;
}
