"use client";

import { useId } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { SettingsField } from "../../components/SettingsField";
import { folderMessage } from "./helpers";
import { fieldMessage } from "./styles";
import type { FolderFieldProps } from "./types";

export function FolderField({ path, folder, onFolderChange, verdict, judging, refusal }: FolderFieldProps) {
  const { t } = useTranslation("settings");
  const id = useId();
  const messageId = `${id}-message`;
  const refused =
    refusal?.outcome === "folder_refused" && refusal.verdict.outcome === "refused" ? refusal.verdict : null;
  const message = folderMessage({
    fromEnvironment: path?.fromEnvironment === true,
    refusal: verdict?.outcome === "refused" ? verdict : refused,
    judging,
    verdict,
  });

  return (
    <SettingsField label={t("libraryPaths.folder.label")} htmlFor={id}>
      <Input
        id={id}
        value={folder}
        onChange={(event) => onFolderChange(event.target.value)}
        disabled={path?.fromEnvironment === true}
        placeholder={t("libraryPaths.folder.placeholder")}
        aria-invalid={message?.tone === "danger"}
        aria-describedby={message === null ? undefined : messageId}
        className="font-mono"
        spellCheck={false}
        autoComplete="off"
      />
      {message === null ? null : (
        <span id={messageId} className={fieldMessage({ tone: message.tone })}>
          {message.text}
        </span>
      )}
    </SettingsField>
  );
}
