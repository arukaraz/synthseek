"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useUpdateLibraryEditions } from "@hooks/api/mutations/settings/useUpdateLibraryEditions";
import { useSettings } from "@hooks/api/queries/useSettings";

import { EngineRow } from "../../components/EngineRow";
import { SettingsCard } from "../../components/SettingsCard";
import { cardDivider } from "../../styles";
import { EDITION_CONTENTS, EDITION_LENGTHS } from "./constants";

export function EditionsCard() {
  const { t } = useTranslation("settings");
  const { data: settings } = useSettings();
  const update = useUpdateLibraryEditions();
  const editions = settings?.library.editions;

  if (editions === undefined) return null;

  return (
    <SettingsCard title={t("editions.title")} description={t("editions.description")} anchor="library-editions">
      <EngineRow
        label={t("editions.content.label")}
        description={t("editions.content.description")}
        control={
          <SegmentedControl
            ariaLabel={t("editions.content.label")}
            value={editions.content}
            disabled={update.isPending}
            options={EDITION_CONTENTS.map((value) => ({ value, label: t(`editions.content.options.${value}`) }))}
            onChange={(content) => update.mutate({ ...editions, content })}
          />
        }
      />
      <div role="separator" className={cardDivider()} />
      <EngineRow
        label={t("editions.length.label")}
        description={t("editions.length.description")}
        control={
          <SegmentedControl
            ariaLabel={t("editions.length.label")}
            value={editions.length}
            disabled={update.isPending}
            options={EDITION_LENGTHS.map((value) => ({ value, label: t(`editions.length.options.${value}`) }))}
            onChange={(length) => update.mutate({ ...editions, length })}
          />
        }
      />
    </SettingsCard>
  );
}
