"use client";

import { Button } from "@components/ui/Button";
import { cn } from "@utils/cn";
import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ACCEPTED_FILE_TYPES } from "../constants";
import { fetchTextFromUrl, filenameFromUrl, formatFromName, formatFromUrl, readFileAsText } from "../helpers";
import {
  dividerLine,
  dropzone,
  dropzoneHint,
  dropzoneTitle,
  errorText,
  sectionDivider,
  stepContainer,
  urlInput,
  urlRow,
} from "../styles";
import type { SourceStepProps } from "../types";

export function SourceStep({ onLoaded }: SourceStepProps) {
  const { t } = useTranslation("library");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [fetching, setFetching] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const format = formatFromName(file.name);
    if (!format) {
      setError(t("jspfImport.source.errorWrongFile"));
      return;
    }
    setError(null);
    try {
      const content = await readFileAsText(file);
      onLoaded(content, format, file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("jspfImport.source.errorReadFile"));
    }
  };

  const handleUrl = async () => {
    const target = url.trim();
    if (!target) return;
    const format = formatFromUrl(target);
    if (!format) {
      setError(t("jspfImport.source.errorWrongUrl"));
      return;
    }
    setFetching(true);
    setError(null);
    try {
      const content = await fetchTextFromUrl(target);
      onLoaded(content, format, filenameFromUrl(target));
    } catch (e) {
      setError(e instanceof Error ? e.message : t("jspfImport.source.errorFetchUrl"));
    } finally {
      setFetching(false);
    }
  };

  return (
    <div className={stepContainer()}>
      <div
        className={cn(dropzone({ active: dragActive }))}
        role="button"
        tabIndex={0}
        aria-label={t("jspfImport.source.uploadAria")}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void handleFile(e.dataTransfer.files[0]);
        }}
      >
        <Upload className="text-fg/40 size-6" />
        <span className={dropzoneTitle()}>{t("jspfImport.source.dropTitle")}</span>
        <span className={dropzoneHint()}>{t("jspfImport.source.dropHint")}</span>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          className="hidden"
          onChange={(e) => void handleFile(e.target.files?.[0])}
        />
      </div>

      <div className={sectionDivider()}>
        <span className={dividerLine()} />
        {t("jspfImport.source.orFromUrl")}
        <span className={dividerLine()} />
      </div>

      <div className={urlRow()}>
        <input
          className={urlInput()}
          type="url"
          placeholder={t("jspfImport.source.urlPlaceholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button variant="secondary" size="sm" disabled={!url.trim() || fetching} onClick={() => void handleUrl()}>
          {fetching ? t("jspfImport.source.fetching") : t("jspfImport.source.fetch")}
        </Button>
      </div>

      {error ? <span className={errorText()}>{error}</span> : null}
    </div>
  );
}
