"use client";

import { useTranslation } from "react-i18next";

import { BoardSettingsEditor } from "@features/discover/components/BoardSettings/BoardSettingsEditor";

import { SettingsCard } from "../../components/SettingsCard";

export function BoardTab() {
  const { t } = useTranslation("settings");

  return (
    <SettingsCard title={t("general.board.title")} description={t("general.board.description")} anchor="board">
      <BoardSettingsEditor />
    </SettingsCard>
  );
}
