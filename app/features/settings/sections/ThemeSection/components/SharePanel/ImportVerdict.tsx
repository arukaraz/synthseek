"use client";

import { useTranslation } from "react-i18next";

import { Checkbox } from "@components/ui/Checkbox";

import { sharePanelCheck, verdictBox, verdictList, verdictWarning } from "./styles";
import type { ImportVerdictProps } from "./types";

export function ImportVerdict({ result, tokensOnly, onTokensOnlyChange }: ImportVerdictProps) {
  const { t } = useTranslation("themeEditor");

  if (!result.ok) {
    return (
      <div className={verdictBox({ tone: "bad" })} role="alert">
        <p>
          <strong>{t("import.cannot")}</strong> {t(`import.${result.reason}`, { detail: result.detail ?? "" })}
        </p>
      </div>
    );
  }

  const hasFreeCss = result.freeCssFiles.length > 0;

  return (
    <>
      <div className={verdictBox()} role="status">
        <p>
          {t("import.summary", {
            name: result.name.trim() === "" ? t("import.unnamed") : result.name,
            scheme: t(`menu.${result.scheme}`).toLocaleLowerCase(),
          })}
        </p>
        <ul className={verdictList()}>
          <li>{t("import.tokens", { count: result.tokenCount, preset: t(`presets.${result.startedFrom}`) })}</li>
          {hasFreeCss ? (
            <li className={verdictWarning()}>{t("import.freeCss", { files: result.freeCssFiles.join(", ") })}</li>
          ) : null}
          {result.removedResources > 0 ? (
            <li className={verdictWarning()}>{t("import.removed", { count: result.removedResources })}</li>
          ) : null}
        </ul>
      </div>
      {hasFreeCss ? (
        <label className={sharePanelCheck()}>
          <Checkbox checked={tokensOnly} onCheckedChange={(next) => onTokensOnlyChange(next === true)} />
          {t("import.tokensOnly")}
        </label>
      ) : null}
    </>
  );
}
