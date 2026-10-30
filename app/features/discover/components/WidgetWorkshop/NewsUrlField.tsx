"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";

import { webUrlOf } from "./helpers";
import { newsUrl, newsUrlHint } from "./styles";
import type { NewsUrlFieldProps } from "./types";

export function NewsUrlField({ url, onCommit }: NewsUrlFieldProps) {
  const { t } = useTranslation("widgets");
  const [text, setText] = useState(url);
  const valid = webUrlOf(text) !== null;

  const commit = () => {
    const next = webUrlOf(text);
    if (next !== null && next !== url) onCommit(next);
  };

  return (
    <div className={newsUrl()}>
      <Input
        size="sm"
        type="url"
        inputMode="url"
        aria-label={t("feeds.url")}
        aria-invalid={!valid}
        value={text}
        placeholder={t("feeds.urlPlaceholder")}
        onChange={(event) => setText(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") commit();
        }}
      />
      <span className={newsUrlHint()}>{valid ? t("feeds.urlHelp") : t("feeds.urlInvalid")}</span>
    </div>
  );
}
