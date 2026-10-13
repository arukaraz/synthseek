"use client";

import { Link2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import { errorText, toolField, toolRow } from "../styles";
import type { LinkFieldProps } from "../types";

export function LinkField({ placeholder, pending, notFound, onSubmit }: LinkFieldProps) {
  const { t } = useTranslation("settings");
  const [url, setUrl] = useState("");
  const submit = () => {
    if (url.trim().length > 0) onSubmit(url.trim());
  };

  return (
    <>
      <form
        className={toolRow()}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className={toolField()}>
          <Input
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm" disabled={pending || url.trim().length === 0}>
          {pending ? <Loader2 className="animate-spin" aria-hidden /> : <Link2 aria-hidden />}
          {t("libraryScan.review.match.useLink")}
        </Button>
      </form>
      {notFound ? <p className={errorText()}>{t("libraryScan.review.match.linkNotFound")}</p> : null}
    </>
  );
}
