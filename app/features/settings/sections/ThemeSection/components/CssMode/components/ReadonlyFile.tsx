"use client";

import { useTranslation } from "react-i18next";

import { THEME_JSON_PATH } from "../constants";
import { readonlyJson } from "../helpers";
import { readonlyBody, readonlyJsonText, readonlyNote } from "../styles";
import type { ReadonlyFileProps } from "../types";

export function ReadonlyFile({ draft }: ReadonlyFileProps) {
  const { t } = useTranslation("themeEditor");
  return (
    <div role="region" tabIndex={0} aria-label={THEME_JSON_PATH} className={readonlyBody()}>
      <pre className={readonlyJsonText()}>{readonlyJson(draft)}</pre>
      <p className={readonlyNote()}>{t("css.readonly")}</p>
    </div>
  );
}
