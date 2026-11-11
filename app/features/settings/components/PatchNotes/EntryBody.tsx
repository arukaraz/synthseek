"use client";

import { useTranslation } from "react-i18next";

import { InlineMarkdown } from "./InlineMarkdown";
import { REPO_ISSUES_URL } from "./constants";
import { deriveNotes } from "./helpers";
import { calloutBox, calloutLabel, issueLink, issuesRow, kind, note, noteLead, notes } from "./styles";
import type { EntryBodyProps } from "./types";

export function EntryBody({ entry }: EntryBodyProps) {
  const { t } = useTranslation("settings");
  const noteLines = deriveNotes(entry.sections);

  return (
    <>
      {entry.callouts?.map((callout, index) => (
        <div key={`${entry.version}-callout-${index}`} className={calloutBox({ tone: callout.level })}>
          <span className={calloutLabel()}>{t(`updates.notes.callout.${callout.level}`)}</span>
          <span>
            <InlineMarkdown text={callout.body} />
          </span>
        </div>
      ))}

      {noteLines.length > 0 ? (
        <ul className={notes()}>
          {noteLines.map((line, index) => (
            <li key={`${entry.version}-note-${index}`} className={line.category ? note() : noteLead()}>
              {line.category ? (
                <span className={kind({ category: line.category })}>
                  {t(`updates.notes.category.${line.category}`)}
                </span>
              ) : null}
              <span>
                <InlineMarkdown text={line.text} />
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {entry.issues && entry.issues.length > 0 ? (
        <div className={issuesRow()}>
          <span>{t("updates.notes.resolves")}</span>
          {entry.issues.map((issue) => (
            <a
              key={issue}
              href={`${REPO_ISSUES_URL}/${issue}`}
              target="_blank"
              rel="noopener noreferrer"
              className={issueLink()}
            >
              #{issue}
            </a>
          ))}
        </div>
      ) : null}
    </>
  );
}
