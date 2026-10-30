"use client";

import { FileUp } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { useApplyBoardTemplate } from "@hooks/api/mutations/board/useApplyBoardTemplate";
import { usePreviewBoardTemplate } from "@hooks/api/mutations/board/usePreviewBoardTemplate";
import type { BoardTemplatePreview } from "@hooks/api/queries/board/types";

import { TEMPLATE_FILE_ACCEPT } from "./constants";
import { hiddenInput, settingHint, settingLabel, templateActions, templateBlock, templateField } from "./styles";
import { TemplateReport } from "./TemplateReport";
import type { TemplateImportProps } from "./types";

export function TemplateImport({ onApplied }: TemplateImportProps) {
  const { t } = useTranslation("widgets");
  const [json, setJson] = useState("");
  const [report, setReport] = useState<BoardTemplatePreview | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const current = useRef(json);
  const preview = usePreviewBoardTemplate();
  const apply = useApplyBoardTemplate();
  const reset = (next: string) => {
    current.current = next;
    setJson(next);
    setReport(null);
  };
  const applicable = report?.ok === true && report.blocked === null;

  return (
    <div className={templateBlock()}>
      <span className={settingLabel()}>{t("board.templates.import")}</span>
      <span className={settingHint()}>{t("board.templates.importHint")}</span>
      <textarea
        className={templateField()}
        value={json}
        aria-label={t("board.templates.field")}
        placeholder={t("board.templates.placeholder")}
        spellCheck={false}
        onChange={(event) => reset(event.target.value)}
      />
      <input
        ref={fileInput}
        type="file"
        accept={TEMPLATE_FILE_ACCEPT}
        className={hiddenInput()}
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) {
            void file
              .text()
              .then(reset)
              .catch(() => toast.error(t("board.templates.fileFailed")));
          }
        }}
      />
      {report ? <TemplateReport report={report} /> : null}
      <div className={templateActions()}>
        <Button variant="ghost" size="sm" onClick={() => fileInput.current?.click()}>
          <FileUp />
          {t("board.templates.file")}
        </Button>
        {report?.ok ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => reset("")}>
              {t("board.templates.cancel")}
            </Button>
            <Button
              size="sm"
              disabled={!applicable || apply.isPending}
              onClick={() =>
                apply.mutate(
                  { json },
                  {
                    onSuccess: (applied) => {
                      reset("");
                      onApplied(applied);
                    },
                  }
                )
              }
            >
              {t("board.templates.apply")}
            </Button>
          </>
        ) : (
          <Button
            size="sm"
            disabled={json.trim() === "" || preview.isPending}
            onClick={() => {
              const checked = json;
              preview.mutate(
                { json: checked },
                { onSuccess: (result) => setReport(current.current === checked ? result : null) }
              );
            }}
          >
            {t("board.templates.check")}
          </Button>
        )}
      </div>
    </div>
  );
}
