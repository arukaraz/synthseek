import { Check, Clock, Disc3, Download, Hourglass, TriangleAlert, Zap } from "lucide-react";

import type { FollowReleaseState } from "@hooks/api/queries/artist-follow/types";

import type { ReleaseStateInfo } from "./types";

export const RELEASE_STATES: Readonly<Record<FollowReleaseState, ReleaseStateInfo>> = {
  announced: { labelKey: "state.announced", glyph: Clock, action: "none", dashed: true },
  available: { labelKey: "state.available", glyph: Disc3, action: "request", dashed: false },
  quota_skipped: { labelKey: "state.quotaSkipped", glyph: TriangleAlert, action: "request", dashed: false },
  requested: { labelKey: "state.requested", glyph: Download, action: "viewRequest", dashed: false },
  pending_approval: { labelKey: "state.pendingApproval", glyph: Hourglass, action: "none", dashed: false },
  auto_requested: { labelKey: "state.autoRequested", glyph: Zap, action: "viewRequest", dashed: false },
  in_library: { labelKey: "state.inLibrary", glyph: Check, action: "play", dashed: false },
};
