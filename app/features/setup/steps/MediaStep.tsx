"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { ChoiceTiles } from "../components/ChoiceTiles";
import { QuestionFrame } from "../components/QuestionFrame";
import { StatusStrip } from "../components/StatusStrip";
import { StepActions } from "../components/StepActions";
import { MEDIA_SERVERS, NO_MEDIA_SERVER } from "../constants";
import { useRecordStep } from "../hooks/useRecordStep";
import { setupForm } from "../styles";
import type { ChoiceTileData, StepProps } from "../types";

export function MediaStep({ onGo }: StepProps) {
  const { t } = useTranslation("setup");
  const { record, pending, failure } = useRecordStep("media", onGo);
  const [selected, setSelected] = useState<string | null>(null);

  const choices: ChoiceTileData[] = [
    ...MEDIA_SERVERS.map((server) => ({
      key: server,
      title: PLAYBACK_SERVER_NAMES[server],
      caption: t("media.existing"),
    })),
    { key: NO_MEDIA_SERVER, title: t("media.none"), caption: t("media.noneCaption") },
  ];

  const handleContinue = () => {
    if (selected === null) return;
    const server = MEDIA_SERVERS.find((candidate) => candidate === selected);
    if (server) onGo("media", server);
    else void record("answered", "downloads");
  };

  return (
    <QuestionFrame step="media" focusKey="media" title={t("media.title")} description={t("media.description")}>
      <div className={setupForm()}>
        <ChoiceTiles
          label={t("media.groupLabel")}
          choices={choices}
          selected={selected}
          disabled={pending}
          onChoose={setSelected}
        />
        {failure ? <StatusStrip tone="error" message={failure} /> : null}
        <StepActions
          forwardLabel={t("actions.continue")}
          forwardBusy={pending}
          forwardDisabled={selected === null}
          onForward={handleContinue}
          onSkip={() => void record("skipped", "downloads")}
        />
      </div>
    </QuestionFrame>
  );
}
