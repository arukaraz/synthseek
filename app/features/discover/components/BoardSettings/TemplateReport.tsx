"use client";

import { useTranslation } from "react-i18next";

import { problemText } from "../WidgetGallery/helpers";
import { importProblem, importProblems } from "../WidgetGallery/styles";
import { templateReportLines } from "./helpers";
import { reportBullet, reportLine, reportList } from "./styles";
import type { TemplateReportProps } from "./types";

export function TemplateReport({ report }: TemplateReportProps) {
  const { t } = useTranslation("widgets");

  if (!report.ok) {
    return (
      <div role="alert">
        <p className={reportLine({ tone: "danger" })}>{t("import.problems", { count: report.problems.length })}</p>
        <ul className={importProblems()}>
          {report.problems.map((entry, index) => (
            <li key={`${entry.path}-${index}`} className={importProblem()}>
              {entry.path ? `${entry.path}: ` : ""}
              {problemText(entry.problem)}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className={reportList()} aria-live="polite">
      {templateReportLines(report).map((line) => (
        <li key={line.key} className={reportLine({ tone: line.tone })}>
          <span className={reportBullet()} aria-hidden>
            •
          </span>
          <span>{line.text}</span>
        </li>
      ))}
    </ul>
  );
}
