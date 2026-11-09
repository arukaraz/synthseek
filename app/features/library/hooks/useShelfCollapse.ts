"use client";

import { useEffect } from "react";

import { isChromeCollapsed, setChromeCollapsed, useChromeCollapsed } from "@hooks/ui/useChromeCollapsed";

import { nextShelfCollapsed } from "../helpers";

export function useShelfCollapse(scrollRoot: HTMLElement | null, enabled: boolean): boolean {
  const collapsed = useChromeCollapsed();

  useEffect(() => {
    if (scrollRoot === null || !enabled) {
      setChromeCollapsed(false);
      return;
    }
    const update = () => {
      setChromeCollapsed(
        nextShelfCollapsed(isChromeCollapsed(), scrollRoot.scrollTop, scrollRoot.scrollHeight - scrollRoot.clientHeight)
      );
    };
    scrollRoot.addEventListener("scroll", update, { passive: true });
    return () => {
      scrollRoot.removeEventListener("scroll", update);
      setChromeCollapsed(false);
    };
  }, [scrollRoot, enabled]);

  return enabled && collapsed;
}
