"use client";

import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

import { field, fieldLabel, nameInput, nameLockedHint, nameText } from "./styles";
import type { WorkshopNameProps } from "./types";

export function WorkshopName({ canRename, nameDraft, maxChars }: WorkshopNameProps) {
  const { t } = useTranslation("contentDetail");
  const { t: tLibrary } = useTranslation("library");
  const nameId = useId();
  const [nameAtFocus, setNameAtFocus] = useState<string | null>(null);
  const reverts = nameAtFocus !== null && nameDraft.draft !== nameAtFocus;
  const label = t("workshop.details.name");
  const lockedHint = tLibrary("playlists.syncedReadonly");

  if (!canRename) {
    return (
      <section className={field()}>
        <h3 className={fieldLabel()}>{label}</h3>
        <p className={nameText()} data-cy="workshop-name-text">
          {nameDraft.shown}
        </p>
        <p className={nameLockedHint()}>{lockedHint}</p>
      </section>
    );
  }

  return (
    <section className={field()}>
      <label htmlFor={nameId} className={fieldLabel()}>
        {label}
      </label>
      <input
        id={nameId}
        type="text"
        className={nameInput()}
        value={nameDraft.draft}
        maxLength={maxChars}
        data-escape-reverts={reverts ? "" : undefined}
        onChange={(event) => nameDraft.change(event.target.value)}
        onFocus={() => setNameAtFocus(nameDraft.draft)}
        onBlur={() => {
          setNameAtFocus(null);
          void nameDraft.finish();
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape" && reverts && nameAtFocus !== null) void nameDraft.revert(nameAtFocus);
        }}
      />
    </section>
  );
}
