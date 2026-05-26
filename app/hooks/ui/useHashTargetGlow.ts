"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ANCHOR_ATTR = "data-anchor-target";
const GLOW_ATTR = "data-glow";
const GLOW_DURATION_MS = 5000;
const WAIT_FOR_MOUNT_MS = 3000;

export function useHashTargetGlow() {
  const pathname = usePathname();

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    const apply = () => {
      const hash = window.location.hash.replace(/^#/, "");
      if (!hash) return;

      const trigger = (el: HTMLElement) => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.setAttribute(GLOW_ATTR, "true");
        const timer = window.setTimeout(() => {
          el.removeAttribute(GLOW_ATTR);
        }, GLOW_DURATION_MS);
        cleanup = () => {
          window.clearTimeout(timer);
          el.removeAttribute(GLOW_ATTR);
        };
      };

      const immediate = document.querySelector<HTMLElement>(`[${ANCHOR_ATTR}="${CSS.escape(hash)}"]`);
      if (immediate) {
        trigger(immediate);
        return;
      }

      const observer = new MutationObserver(() => {
        const el = document.querySelector<HTMLElement>(`[${ANCHOR_ATTR}="${CSS.escape(hash)}"]`);
        if (el) {
          observer.disconnect();
          trigger(el);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });

      const giveUp = window.setTimeout(() => observer.disconnect(), WAIT_FOR_MOUNT_MS);
      cleanup = () => {
        window.clearTimeout(giveUp);
        observer.disconnect();
      };
    };

    apply();
    const onHashChange = () => {
      cleanup?.();
      apply();
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      cleanup?.();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [pathname]);
}
