"use client";

import { Pause, Play } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useMotionReduced } from "@hooks/ui/useMotionReduced";

import { mediaFrame, videoFrame, videoToggle, videoToggleIcon } from "./styles";
import type { HighlightVideoProps } from "./types";

export function HighlightVideo({ src, poster, alt, onError }: HighlightVideoProps) {
  const { t } = useTranslation("settings");
  const reducedMotion = useMotionReduced();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => setPlaying(false));
      return;
    }
    video.pause();
  };

  return (
    <div className={videoFrame()}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        aria-label={alt}
        className={mediaFrame()}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={onError}
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={t(playing ? "updates.whatsNew.pauseVideo" : "updates.whatsNew.playVideo")}
        className={videoToggle()}
      >
        {playing ? <Pause className={videoToggleIcon()} /> : <Play className={videoToggleIcon()} />}
      </button>
    </div>
  );
}
