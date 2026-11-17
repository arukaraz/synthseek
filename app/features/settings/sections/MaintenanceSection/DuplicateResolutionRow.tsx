"use client";

import { useTranslation } from "react-i18next";

import { SegmentedControl } from "@components/ui/SegmentedControl";
import { useUpdateDuplicateResolution } from "@hooks/api/mutations/settings/useUpdateDuplicateResolution";
import { useSettings } from "@hooks/api/queries/useSettings";

import { EngineRow } from "../../components/EngineRow";
import { cardDivider } from "../../styles";
import { DUPLICATE_RESOLUTIONS } from "./constants";

export function DuplicateResolutionRow() {
  const { t } = useTranslation("settings");
  const { data: settings } = useSettings();
  const update = useUpdateDuplicateResolution();
  const resolve = settings?.library.duplicates.resolve;

  if (resolve === undefined) return null;

  return (
    <>
      <EngineRow
        anchor="library.duplicates.resolve"
        label={t("libraryScan.duplicates.resolve.label")}
        description={t(`libraryScan.duplicates.resolve.descriptions.${resolve}`)}
        control={
          <SegmentedControl
            ariaLabel={t("libraryScan.duplicates.resolve.label")}
            value={resolve}
            disabled={update.isPending}
            options={DUPLICATE_RESOLUTIONS.map((value) => ({
              value,
              label: t(`libraryScan.duplicates.resolve.options.${value}`),
            }))}
            onChange={(next) => update.mutate({ resolve: next })}
          />
        }
      />
      <div role="separator" className={cardDivider()} />
    </>
  );
}
