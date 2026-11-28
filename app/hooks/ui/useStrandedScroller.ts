"use client";

import { useEffect, useState } from "react";

import { TABBABLE_SELECTOR } from "./constants";

export function useStrandedScroller(node: HTMLElement | null, scrolls: boolean): boolean {
  const [reachable, setReachable] = useState(true);

  useEffect(() => {
    if (node === null || !scrolls) return;
    const update = () => setReachable(node.querySelector(TABBABLE_SELECTOR) !== null);
    update();
    const mutation = new MutationObserver(update);
    mutation.observe(node, { childList: true, subtree: true });
    return () => mutation.disconnect();
  }, [node, scrolls]);

  return scrolls && !reachable;
}
