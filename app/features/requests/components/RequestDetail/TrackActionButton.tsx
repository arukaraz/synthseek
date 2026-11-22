"use client";

import { Button } from "@components/ui/Button";
import { useTranslation } from "react-i18next";

import { TRACK_ACTION_META } from "./consts";
import { trackActionTone } from "./styles";
import type { TrackActionButtonProps } from "./types";

export function TrackActionButton({ action, onAction }: TrackActionButtonProps) {
  const { t } = useTranslation("requests");
  const meta = TRACK_ACTION_META[action.id];
  const Icon = meta.icon;
  const locked = action.lock !== null;

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={locked}
      title={action.lock !== null ? t(`trackActions.lock.${action.lock}`) : undefined}
      onClick={() => onAction(action.id)}
      className={locked ? undefined : trackActionTone({ tone: meta.tone })}
    >
      <Icon className="mr-1.5 size-3.5" aria-hidden />
      {t(meta.labelKey)}
    </Button>
  );
}
