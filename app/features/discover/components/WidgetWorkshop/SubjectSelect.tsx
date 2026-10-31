"use client";

import { useTranslation } from "react-i18next";

import { SelectMenu } from "@components/ui/SelectMenu";

import { PLAYLISTS_SUBJECT, RECAP_SUBJECT } from "./constants";
import type { SubjectSelectProps } from "./types";

export function SubjectSelect({ workshop, value, grammar }: SubjectSelectProps) {
  const { t } = useTranslation("widgets");

  return (
    <SelectMenu
      ariaLabel={t("steps.show")}
      value={value}
      options={[
        { value: PLAYLISTS_SUBJECT, label: t("subjects.playlists") },
        ...grammar.subjects.map((entry) => ({ value: entry.key, label: t(`subjects.${entry.key}`) })),
        { value: RECAP_SUBJECT, label: t("subjects.recap") },
      ]}
      onChange={workshop.setRecipeSubject}
    />
  );
}
