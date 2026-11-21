"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useThemeFetchers, useThemeHistory } from "@hooks/api/queries/theme";
import { cn } from "@utils/cn";

import type { ThemeVersion } from "../../../types";
import { versionIsOpen, withFile } from "../helpers";
import {
  historyEmpty,
  historyHead,
  historyList,
  historyPanel,
  historyPath,
  historySeparator,
  historyTitle,
  sidePanel,
} from "../styles";
import type { HistoryPanelProps } from "../types";
import { HistoryRow } from "./HistoryRow";

export function HistoryPanel({ editor, path, generated }: HistoryPanelProps) {
  const { t } = useTranslation("themeEditor");
  const history = useThemeHistory(generated ? null : path);
  const fetchers = useThemeFetchers();
  const [fetched, setFetched] = useState<ReadonlyMap<string, string>>(new Map());
  const latest = useRef(editor);

  useEffect(() => {
    latest.current = editor;
  });

  const text = generated ? "" : editor.draft.files[path];
  const savedText = Object.hasOwn(editor.saved.files, path) ? editor.saved.files[path] : undefined;
  const versions = history.data?.versions ?? [];
  const savedNow = versions.find((version) => version.current)?.id;

  const restore = (version: ThemeVersion) => {
    void fetchers
      .version(path, version.id)
      .then(({ text: restored }) => {
        setFetched((previous) => new Map(previous).set(`${path}:${version.id}`, restored));
        const current = latest.current;
        current.change(withFile(current.draft, path, restored));
        toast.success(t("history.restoredToast"));
      })
      .catch(() => toast.error(t("history.restoreFailed")));
  };

  return (
    <section className={cn(sidePanel(), historyPanel())}>
      <div className={historyHead()}>
        <h3 className={historyTitle()}>{t("history.title")}</h3>
        <InfoTooltip description={t("history.tip")} triggerLabel={t("history.about")} />
      </div>
      <code className={historyPath()}>{path}</code>
      <hr className={historySeparator()} />
      {generated ? <p className={historyEmpty()}>{t("history.generated")}</p> : null}
      {!generated && history.data !== undefined && versions.length === 0 ? (
        <p className={historyEmpty()}>{t("history.noVersions")}</p>
      ) : null}
      {versions.length > 0 ? (
        <ul className={historyList()}>
          {versions.map((version) => (
            <HistoryRow
              key={version.id}
              version={version}
              savedNow={version.id === savedNow}
              disabled={versionIsOpen(version.current, text, savedText, fetched.get(`${path}:${version.id}`))}
              onRestore={restore}
            />
          ))}
        </ul>
      ) : null}
    </section>
  );
}
