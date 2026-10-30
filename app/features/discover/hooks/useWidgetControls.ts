"use client";

import { useCallback, useMemo } from "react";

import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import type { WidgetAction } from "@hooks/api/queries/widgets/types";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { itemControls } from "../components/CustomWidget/helpers";
import type { WidgetHandlers, WidgetItem, WidgetItemActions } from "../components/CustomWidget/types";

export function useWidgetControls(action: WidgetAction): WidgetItemActions {
  const { playEntity } = useEntityPlayback();
  const { openForTarget, requestResult } = useContentRequestFlow();
  const handlers = useMemo<WidgetHandlers>(
    () => ({
      play: (target) => void playEntity(target),
      request: requestResult,
      open: openForTarget,
      openUrl: (url) => void window.open(url, "_blank", "noopener,noreferrer"),
    }),
    [playEntity, requestResult, openForTarget]
  );
  return useCallback((item: WidgetItem) => itemControls(item, action, handlers), [action, handlers]);
}
