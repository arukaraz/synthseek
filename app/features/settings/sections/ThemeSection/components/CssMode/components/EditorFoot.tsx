"use client";

import { useTranslation } from "react-i18next";

import { TOKEN_REFERENCE_URL } from "../../../constants";
import { codeFoot, docLink, footSpacer, statusError, statusText, statusWarning } from "../styles";
import type { EditorFootProps } from "../types";

export function EditorFoot({ status }: EditorFootProps) {
  const { t } = useTranslation("themeEditor");
  return (
    <div className={codeFoot()}>
      <a href={TOKEN_REFERENCE_URL} target="_blank" rel="noopener noreferrer" className={docLink()}>
        {t("css.reference")}
      </a>
      <span className={footSpacer()} />
      {status === null ? null : status.errors > 0 ? (
        <span className={statusError()}>{t("css.errors", { count: status.errors })}</span>
      ) : (
        <>
          {status.warnings > 0 ? (
            <span className={statusWarning()}>{t("css.warnings", { count: status.warnings })}</span>
          ) : null}
          <span className={statusText()}>{status.saved ? t("css.saved") : t("css.notSaved")}</span>
        </>
      )}
    </div>
  );
}
