"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useImportWidgetPreview } from "@hooks/api/mutations/widgets/useImportWidgetPreview";
import type { WidgetImportReport } from "@hooks/api/queries/widgets/types";

import { problemText } from "./helpers";
import { importActions, importBody, importField, importProblem, importProblems } from "./styles";
import type { ImportWidgetDialogProps } from "./types";

export function ImportWidgetDialog({ open, onClose, onImported }: ImportWidgetDialogProps) {
  const { t } = useTranslation("widgets");
  const [json, setJson] = useState("");
  const [report, setReport] = useState<WidgetImportReport | null>(null);
  const check = useImportWidgetPreview();

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setReport(null);
          onClose();
        }
      }}
    >
      <DialogContent className={importBody()}>
        <DialogTitle>{t("import.title")}</DialogTitle>
        <DialogDescription>{t("import.description")}</DialogDescription>
        <textarea
          className={importField()}
          value={json}
          aria-label={t("import.field")}
          placeholder={t("import.placeholder")}
          spellCheck={false}
          onChange={(event) => {
            setJson(event.target.value);
            setReport(null);
          }}
        />
        {report && !report.ok ? (
          <div role="alert">
            <p>{t("import.problems", { count: report.problems.length })}</p>
            <ul className={importProblems()}>
              {report.problems.map((entry, index) => (
                <li key={`${entry.path}-${index}`} className={importProblem()}>
                  {entry.path ? `${entry.path}: ` : ""}
                  {problemText(entry.problem)}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        <div className={importActions()}>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {t("workshop.cancel")}
          </Button>
          <Button
            size="sm"
            disabled={json.trim() === "" || check.isPending}
            onClick={() =>
              check.mutate(
                { json },
                {
                  onSuccess: (result) => {
                    setReport(result);
                    if (result.ok) {
                      setJson("");
                      onImported(result.draft);
                    }
                  },
                }
              )
            }
          >
            {t("import.check")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
