"use client";

import { useId, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { Checkbox } from "@components/ui/Checkbox";
import { Input } from "@components/ui/Input";
import { downloadText } from "@utils/download";

import { THEME_NAME_MAX_LENGTH } from "./constants";
import { exportFilename, exportText } from "./helpers";
import {
  sharePanelButton,
  sharePanelCheck,
  sharePanelField,
  sharePanelIntro,
  sharePanelLabel,
  sharePanelRow,
  sharePanelText,
} from "./styles";
import type { ExportPanelProps } from "./types";

export function ExportPanel({ editor }: ExportPanelProps) {
  const { t } = useTranslation("themeEditor");
  const nameId = useId();
  const field = useRef<HTMLTextAreaElement>(null);
  const [includeFreeCss, setIncludeFreeCss] = useState(true);
  const { draft } = editor;
  const text = useMemo(() => exportText(draft, includeFreeCss), [draft, includeFreeCss]);

  const rename = (name: string) => editor.change({ ...draft, meta: { ...draft.meta, name } });

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("export.copied"));
    } catch {
      field.current?.focus();
      field.current?.select();
      toast.error(t("export.copyFailed"));
    }
  };

  return (
    <>
      <p className={sharePanelIntro()}>{t("export.intro")}</p>
      <div className={sharePanelField()}>
        <label htmlFor={nameId} className={sharePanelLabel()}>
          {t("export.name")}
        </label>
        <Input
          id={nameId}
          type="text"
          maxLength={THEME_NAME_MAX_LENGTH}
          value={draft.meta.name}
          onChange={(event) => rename(event.target.value)}
        />
      </div>
      <label className={sharePanelCheck()}>
        <Checkbox checked={includeFreeCss} onCheckedChange={(next) => setIncludeFreeCss(next === true)} />
        {t("export.includeFree")}
      </label>
      <textarea
        ref={field}
        className={sharePanelText()}
        value={text}
        readOnly
        spellCheck={false}
        aria-label={t("export.document")}
      />
      <div className={sharePanelRow()}>
        <Button size="sm" onClick={() => void copy()}>
          {t("export.copy")}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className={sharePanelButton()}
          onClick={() => downloadText(exportFilename(draft.meta.name), text)}
        >
          {t("export.download")}
        </Button>
      </div>
    </>
  );
}
