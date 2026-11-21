"use client";

import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";

import { dirtyDot, treeLabel, treeLine, treeRow } from "../styles";
import type { TreeRowProps } from "../types";

export function TreeRow({ file, current, top, onOpen, onDelete }: TreeRowProps) {
  const { t } = useTranslation("themeEditor");
  return (
    <li className={treeLine()}>
      <button
        type="button"
        data-broken={file.broken}
        aria-current={current ? "true" : undefined}
        className={treeRow({ top, current, broken: file.broken })}
        onClick={() => onOpen(file.path)}
      >
        <span className={treeLabel()}>{file.label}</span>
        {file.dirty ? <span role="img" aria-label={t("css.notSaved")} className={dirtyDot()} /> : null}
      </button>
      {onDelete === undefined ? null : (
        <IconButton
          type="button"
          icon={Trash2}
          size="sm"
          variant="ghostRed"
          animated={false}
          aria-label={t("css.deleteFile", { file: file.label })}
          onClick={() => onDelete(file.path)}
        />
      )}
    </li>
  );
}
