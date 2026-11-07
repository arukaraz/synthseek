"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { TEMPLATES_DOCS_URL } from "./constants";
import { settingsLink, templatesBody } from "./styles";
import { TemplateExport } from "./TemplateExport";
import { TemplateImport } from "./TemplateImport";
import type { TemplatesPanelProps } from "./types";

export function TemplatesPanel({ lists, staged, onStage, onUnstage }: TemplatesPanelProps) {
  const { t } = useTranslation("widgets");

  return (
    <div className={templatesBody()}>
      <a href={TEMPLATES_DOCS_URL} target="_blank" rel="noopener noreferrer" className={settingsLink()}>
        {t("board.templates.docs")}
        <ExternalLink className="size-3.5" aria-hidden />
      </a>
      <TemplateExport lists={lists} />
      <TemplateImport staged={staged} onStage={onStage} onUnstage={onUnstage} />
    </div>
  );
}
