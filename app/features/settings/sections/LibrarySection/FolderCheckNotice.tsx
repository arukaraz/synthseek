"use client";

import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Notice } from "@components/ui/Notice";

import { checkRow } from "./styles";
import type { FolderCheckNoticeProps } from "./types";

export function FolderCheckNotice({ path, check, checking, canCheck, onCheck, refusal }: FolderCheckNoticeProps) {
  const { t } = useTranslation("settings");
  const result = refusal?.outcome === "folder_unverified" ? refusal : check;

  if (result === null) {
    return <Notice variant="danger" title={t("libraryPaths.folder.check.failed")} />;
  }

  if (result !== undefined && result.found === result.sampled) {
    return (
      <Notice
        variant="success"
        title={t("libraryPaths.folder.check.found", {
          found: result.found.toLocaleString(),
          sampled: result.sampled.toLocaleString(),
        })}
      />
    );
  }

  if (result !== undefined) {
    return (
      <Notice
        variant="danger"
        title={t("libraryPaths.folder.check.missing", {
          found: result.found.toLocaleString(),
          sampled: result.sampled.toLocaleString(),
          label: path.label,
        })}
      />
    );
  }

  return (
    <Notice
      variant="info"
      title={t("libraryPaths.folder.check.needed", {
        count: path.files,
        formatted: path.files.toLocaleString(),
        label: path.label,
      })}
    >
      <div className={checkRow()}>
        <Button variant="secondary" size="sm" onClick={onCheck} disabled={!canCheck || checking}>
          {checking ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
          {t("libraryPaths.folder.check.action")}
        </Button>
      </div>
    </Notice>
  );
}
