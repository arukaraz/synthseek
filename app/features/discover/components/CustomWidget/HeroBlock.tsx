"use client";

import { Download, Play } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { primaryGradientButton } from "@theme/utilities/styles";

import { AUTO_ROTATE_INTERVAL } from "../TrendingHero/constants";
import {
  heroContent,
  heroFrame,
  heroImageOverlayBottom,
  heroImageOverlayLeft,
  heroSubtitle,
  heroTitle,
} from "../TrendingHero/styles";
import { TrendingHeroNav } from "../TrendingHero/TrendingHeroNav";
import { CoverArt } from "../WidgetRow/CoverArt";
import { heroBadge, heroCover } from "./styles";
import type { WidgetBlockProps } from "./types";

export function HeroBlock({ items, accent, controls, heading }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const [index, setIndex] = useState(0);
  const [rotating, setRotating] = useState(true);
  const total = items.length;
  const item = items[index] ?? items[0];

  useEffect(() => {
    if (!rotating || total <= 1) return;
    const interval = setInterval(() => setIndex((current) => (current + 1) % total), AUTO_ROTATE_INTERVAL);
    return () => clearInterval(interval);
  }, [rotating, total]);

  if (!item) return null;
  const { onSelect, coverAction } = controls(item);

  return (
    <div
      data-acc={accent}
      className={heroFrame()}
      onMouseEnter={() => setRotating(false)}
      onMouseLeave={() => setRotating(true)}
    >
      <span className={heroCover()}>
        <CoverArt src={item.cover} seed={item.key} sizes="(max-width: 768px) 100vw, 60vw" />
        <span className={heroImageOverlayBottom()} />
        <span className={heroImageOverlayLeft()} />
      </span>
      <div className={heroBadge()}>
        <heading.icon aria-hidden />
        {heading.name}
      </div>
      <div className={heroContent()}>
        {onSelect ? (
          <button type="button" className={heroTitle()} onClick={onSelect}>
            {item.title}
          </button>
        ) : (
          <h2 className={heroTitle()}>{item.title}</h2>
        )}
        <p className={heroSubtitle()}>{item.subtitle}</p>
        {coverAction ? (
          <button
            type="button"
            className={primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" })}
            aria-label={coverAction.label}
            onClick={coverAction.onClick}
          >
            {coverAction.kind === "play" ? <Play className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
            {coverAction.kind === "play" ? t("customWidget.play") : t("customWidget.request")}
          </button>
        ) : null}
      </div>
      <TrendingHeroNav
        total={total}
        currentIndex={index}
        onSelect={setIndex}
        onPrev={() => setIndex((current) => (current - 1 + total) % total)}
        onNext={() => setIndex((current) => (current + 1) % total)}
      />
    </div>
  );
}
