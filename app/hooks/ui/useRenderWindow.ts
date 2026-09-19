"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { RENDER_WINDOW_STEP } from "./constants";

export function useRenderWindow<TItem>(items: readonly TItem[], resetKey: string, step: number = RENDER_WINDOW_STEP) {
  const [limit, setLimit] = useState(step);

  useEffect(() => {
    setLimit(step);
  }, [resetKey, step]);

  const visible = useMemo(() => (limit >= items.length ? items : items.slice(0, limit)), [items, limit]);
  const loadMore = useCallback(() => setLimit((current) => current + step), [step]);

  return { visible, hasMore: limit < items.length, loadMore };
}
