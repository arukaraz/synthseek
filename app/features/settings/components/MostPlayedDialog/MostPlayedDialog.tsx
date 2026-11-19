"use client";

import { useTranslation } from "react-i18next";

import { BottomSheet, BottomSheetHeader } from "@components/ui/BottomSheet";
import { useFollowMostPlayed } from "@hooks/api/mutations/artist-follow/useFollowMostPlayed";

import { MostPlayedBody } from "./MostPlayedBody";
import type { MostPlayedDialogProps } from "./types";

export function MostPlayedDialog({ open, onOpenChange }: MostPlayedDialogProps) {
  const { t } = useTranslation("follows");
  const run = useFollowMostPlayed();

  return (
    <BottomSheet open={open} onOpenChange={onOpenChange} size="compact" className="sm:max-w-lg">
      <BottomSheetHeader title={t("mostPlayed.title")} subtitle={t("mostPlayed.description")} />
      <MostPlayedBody
        follow={run.follow}
        running={run.phase === "running"}
        progress={run.progress}
        onClose={() => onOpenChange(false)}
      />
    </BottomSheet>
  );
}
