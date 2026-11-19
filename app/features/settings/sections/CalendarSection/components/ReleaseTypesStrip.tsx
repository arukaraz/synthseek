"use client";

import { useTranslation } from "react-i18next";

import { useSetFollowPreferences } from "@hooks/api/mutations/artist-follow/useSetFollowPreferences";
import type { FollowTypeKey } from "@hooks/api/queries/artist-follow/types";
import { useFollowPreferences } from "@hooks/api/queries/artist-follow/useFollowPreferences";
import { cn } from "@utils/cn";

import { FOLLOW_TYPE_LABEL_KEYS, FOLLOW_TYPE_ORDER } from "@utils/follow-format";

import { hintText, typeChip, typesLabel, typesStrip } from "../styles";
import type { ReleaseTypesStripProps } from "./types";

export function ReleaseTypesStrip({ className }: ReleaseTypesStripProps) {
  const { t } = useTranslation("follows");
  const preferences = useFollowPreferences();
  const save = useSetFollowPreferences();
  const types = preferences.data?.types;
  const enabled = types ? FOLLOW_TYPE_ORDER.filter((key) => types[key]) : [];
  const lastOne = enabled.length === 1;

  const toggle = (key: FollowTypeKey) => {
    if (!types) return;
    const next = { ...types, [key]: !types[key] };
    if (!next.album && !next.ep && !next.single) return;
    save.mutate(next);
  };

  return (
    <div className={cn("flex flex-col gap-1", className)} data-anchor-target="release-types">
      <div className={typesStrip()} role="group" aria-label={t("releases.typesLabel")}>
        <span className={typesLabel()}>{t("releases.typesLabel")}</span>
        {FOLLOW_TYPE_ORDER.map((key) => {
          const on = types?.[key] ?? false;
          const locked = on && lastOne;
          return (
            <button
              key={key}
              type="button"
              className={typeChip({ on, locked })}
              aria-pressed={on}
              aria-disabled={locked || types === undefined}
              aria-describedby={locked ? "release-types-hint" : undefined}
              onClick={() => toggle(key)}
            >
              {t(FOLLOW_TYPE_LABEL_KEYS[key])}
            </button>
          );
        })}
      </div>
      {preferences.isError && types === undefined ? (
        <p id="release-types-hint" className={hintText()} role="alert">
          {t("releases.typesLoadError")}
        </p>
      ) : (
        <p id="release-types-hint" className={hintText()}>
          {lastOne ? t("releases.keepOne") : t("releases.typesHint")}
        </p>
      )}
    </div>
  );
}
