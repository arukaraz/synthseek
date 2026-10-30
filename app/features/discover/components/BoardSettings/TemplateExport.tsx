"use client";

import { Copy } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";
import { useExportBoardTemplate } from "@hooks/api/mutations/board/useExportBoardTemplate";

import { templateJsonOf } from "./helpers";
import { settingHint, settingLabel, templateBlock, templateNameField, templateRow } from "./styles";
import type { TemplateExportProps } from "./types";

export function TemplateExport({ items }: TemplateExportProps) {
  const { t } = useTranslation("widgets");
  const [name, setName] = useState(() => t("board.templates.defaultName"));
  const exporter = useExportBoardTemplate();

  return (
    <div className={templateBlock()}>
      <span className={settingLabel()}>{t("board.templates.export")}</span>
      <span className={settingHint()}>{t("board.templates.exportHint")}</span>
      <div className={templateRow()}>
        <Input
          size="sm"
          className={templateNameField()}
          value={name}
          aria-label={t("board.templates.name")}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={name.trim() === "" || exporter.isPending}
          onClick={() =>
            exporter.mutate(
              { name: name.trim(), description: "", items },
              {
                onSuccess: (template) => {
                  void Promise.resolve()
                    .then(() => navigator.clipboard.writeText(templateJsonOf(template)))
                    .then(() => toast.success(t("board.templates.copied")))
                    .catch(() => toast.error(t("board.templates.copyFailed")));
                },
              }
            )
          }
        >
          <Copy />
          {t("board.templates.copy")}
        </Button>
      </div>
    </div>
  );
}
