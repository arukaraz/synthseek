"use client";

import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";

import { TEMPLATES_DOCS_URL } from "./constants";
import { settingsLink, templatesBody, templatesDialog, templatesHead, templatesHint } from "./styles";
import { TemplateExport } from "./TemplateExport";
import { TemplateImport } from "./TemplateImport";
import type { BoardTemplatesDialogProps } from "./types";

export function BoardTemplatesDialog({ items, onApplied, onClose }: BoardTemplatesDialogProps) {
  const { t } = useTranslation("widgets");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent animation="panel" className={templatesDialog()}>
        <div className={templatesHead()}>
          <DialogTitle>{t("board.templates.title")}</DialogTitle>
          <DialogDescription className={templatesHint()}>
            <a href={TEMPLATES_DOCS_URL} target="_blank" rel="noopener noreferrer" className={settingsLink()}>
              {t("board.templates.docs")}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </DialogDescription>
        </div>
        <div className={templatesBody()}>
          <TemplateExport items={items} />
          <TemplateImport onApplied={onApplied} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
