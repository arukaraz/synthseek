"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";

import { ExportPanel } from "./ExportPanel";
import { ImportPanel } from "./ImportPanel";
import { sharePanel, sharePanelHead, sharePanelTitle } from "./styles";
import type { SharePanelProps } from "./types";

export function SharePanel({ kind, editor, onClose }: SharePanelProps) {
  const { t } = useTranslation("themeEditor");

  return (
    <section className={sharePanel()} aria-label={t(`${kind}.title`)}>
      <div className={sharePanelHead()}>
        <h3 className={sharePanelTitle()}>{t(`${kind}.title`)}</h3>
        <IconButton icon={X} variant="ghost" aria-label={t("export.close")} onClick={onClose} />
      </div>
      {kind === "export" ? <ExportPanel editor={editor} /> : <ImportPanel editor={editor} onClose={onClose} />}
    </section>
  );
}
