"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PLAYBACK_PROBLEM_ID } from "./constants";
import { playbackProblem } from "./styles";
import type { PlaybackProblemProps } from "./types";

export function PlaybackProblem({ visible }: PlaybackProblemProps) {
  const { t } = useTranslation("player");

  return (
    <p id={PLAYBACK_PROBLEM_ID} hidden={!visible} className={playbackProblem({ visible })} data-playback-problem>
      {visible ? <TriangleAlert className="size-4 shrink-0" aria-hidden /> : null}
      {t("problem.playback")}
    </p>
  );
}
