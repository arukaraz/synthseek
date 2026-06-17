"use client";

import { SocialIcon } from "@components/ui/SocialIcon";
import { useDismissable } from "@hooks/ui/useDismissable";
import { cn } from "@utils/cn";
import { Share2 } from "lucide-react";
import type { CSSProperties } from "react";
import { useTranslation } from "react-i18next";

import { SOCIAL_BRAND_VAR, shareFanItemCss, shareFanItemStyle } from "./helpers";
import { shareFab, shareFanRoot, shareIcon, shareItem } from "./styles";
import type { ShareFanProps } from "./types";

export function ShareFan({ socials }: ShareFanProps) {
  const { t } = useTranslation("contentDetail");
  const { open, toggle, containerRef } = useDismissable<HTMLDivElement>();

  if (socials.length === 0) return null;

  return (
    <div ref={containerRef} className={shareFanRoot()}>
      {socials.map((social, index) => {
        const geometry = shareFanItemStyle(index, socials.length);
        const itemStyle = {
          ...shareFanItemCss(geometry, open),
          "--lc": SOCIAL_BRAND_VAR[social.brand],
        } as CSSProperties;
        return (
          <a
            key={social.brand}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            aria-label={t(`social.${social.brand}`)}
            className={cn("share-fan-item", open ? "share-fan-item-open" : "share-fan-item-collapsed", shareItem())}
            style={itemStyle}
          >
            <SocialIcon brand={social.brand} className={shareIcon()} />
          </a>
        );
      })}

      <button
        type="button"
        aria-expanded={open}
        aria-label={open ? t("shareCollapse") : t("shareExpand")}
        className={shareFab({ open })}
        onClick={toggle}
      >
        <Share2 className="size-4" aria-hidden />
      </button>
    </div>
  );
}
