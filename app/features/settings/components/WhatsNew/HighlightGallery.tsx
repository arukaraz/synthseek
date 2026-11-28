"use client";

import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMotionReduced } from "@hooks/ui/useMotionReduced";
import { useSwipe } from "@hooks/ui/useSwipe";
import { cn } from "@utils/cn";

import { GALLERY_INTERVAL_MS, MEDIA_FRAME } from "./constants";
import { mediaUrl, wrapSlide } from "./helpers";
import {
  galleryArrow,
  galleryArrowIcon,
  galleryCaption,
  galleryDot,
  galleryDots,
  galleryFrame,
  gallerySlide,
  galleryToggle,
  mediaFrame,
  videoToggleIcon,
} from "./styles";
import type { HighlightGalleryProps } from "./types";

export function HighlightGallery({ slides, mediaPath, onError }: HighlightGalleryProps) {
  const { t } = useTranslation("settings");
  const reducedMotion = useMotionReduced();
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [hovering, setHovering] = useState(false);
  const total = slides.length;
  const playing = choice ?? !reducedMotion;

  useEffect(() => {
    if (!playing || hovering) return;
    const timer = window.setTimeout(() => setIndex((current) => wrapSlide(current + 1, total)), GALLERY_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [playing, hovering, index, total]);

  const show = (next: number) => {
    setChoice(false);
    setIndex(wrapSlide(next, total));
  };
  const swipe = useSwipe({ onSwipeLeft: () => show(index + 1), onSwipeRight: () => show(index - 1) });

  return (
    <div
      role="group"
      aria-label={t("updates.whatsNew.gallery")}
      className={galleryFrame()}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
      {...swipe}
    >
      {slides.map((slide, position) => (
        <Image
          key={slide.file}
          src={mediaUrl(mediaPath, slide.file)}
          alt={slide.alt}
          aria-hidden={position !== index}
          width={MEDIA_FRAME.WIDTH}
          height={MEDIA_FRAME.HEIGHT}
          unoptimized
          className={cn(mediaFrame(), gallerySlide({ current: position === index }))}
          onError={onError}
        />
      ))}
      <span className={galleryCaption()} aria-live={playing ? "off" : "polite"}>
        {slides[index].caption}
      </span>
      <button
        type="button"
        onClick={() => show(index - 1)}
        aria-label={t("updates.whatsNew.previousSlide")}
        className={galleryArrow({ side: "previous" })}
      >
        <ChevronLeft className={galleryArrowIcon()} />
      </button>
      <button
        type="button"
        onClick={() => show(index + 1)}
        aria-label={t("updates.whatsNew.nextSlide")}
        className={galleryArrow({ side: "next" })}
      >
        <ChevronRight className={galleryArrowIcon()} />
      </button>
      <div className={galleryDots()}>
        {slides.map((slide, position) => (
          <button
            key={slide.file}
            type="button"
            onClick={() => show(position)}
            aria-label={t("updates.whatsNew.showSlide", { current: position + 1, total })}
            aria-current={position === index}
            className={galleryDot({ current: position === index })}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={() => setChoice(!playing)}
        aria-label={t(playing ? "updates.whatsNew.pauseSlides" : "updates.whatsNew.playSlides")}
        className={galleryToggle()}
      >
        {playing ? <Pause className={videoToggleIcon()} /> : <Play className={videoToggleIcon()} />}
      </button>
    </div>
  );
}
