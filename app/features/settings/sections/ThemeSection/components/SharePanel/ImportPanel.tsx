"use client";

import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { Button } from "@components/ui/Button";
import { useCheckThemeImport } from "@hooks/api/mutations/theme";
import { withImport } from "@theme/custom";

import { IMPORT_FILE_ACCEPT, IMPORT_PLACEHOLDER } from "./constants";
import { isImportTooLarge } from "./helpers";
import { ImportVerdict } from "./ImportVerdict";
import { hiddenFileInput, sharePanelButton, sharePanelIntro, sharePanelRow, sharePanelText } from "./styles";
import type { CheckedImport, ImportPanelProps } from "./types";

export function ImportPanel({ editor, onClose }: ImportPanelProps) {
  const { t } = useTranslation("themeEditor");
  const fileInput = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [checked, setChecked] = useState<CheckedImport | null>(null);
  const [tokensOnly, setTokensOnly] = useState(false);
  const check = useCheckThemeImport();

  const current = checked !== null && checked.text === text ? checked.result : null;
  const importable = current !== null && current.ok ? current : null;

  const runCheck = () => {
    const asked = text;
    check.mutate({ document: asked }, { onSuccess: (result) => setChecked({ text: asked, result }) });
  };

  const apply = () => {
    if (importable === null) return;
    editor.change(withImport(editor.draft, importable, tokensOnly));
    onClose();
    toast.success(t("import.appliedToast"));
  };

  const readFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file === undefined) return;
    if (isImportTooLarge(file.size)) {
      toast.error(t("import.tooLarge"));
      return;
    }
    void file
      .text()
      .then(setText)
      .catch(() => toast.error(t("import.notJson")));
  };

  return (
    <>
      <p className={sharePanelIntro()}>{t("import.intro")}</p>
      <textarea
        className={sharePanelText()}
        value={text}
        spellCheck={false}
        placeholder={IMPORT_PLACEHOLDER}
        aria-label={t("import.document")}
        onChange={(event) => setText(event.target.value)}
      />
      <div className={sharePanelRow()}>
        <input
          ref={fileInput}
          type="file"
          accept={IMPORT_FILE_ACCEPT}
          className={hiddenFileInput()}
          tabIndex={-1}
          aria-hidden
          onChange={readFile}
        />
        <Button size="sm" variant="ghost" className={sharePanelButton()} onClick={() => fileInput.current?.click()}>
          {t("import.chooseFile")}
        </Button>
      </div>
      {current !== null ? (
        <ImportVerdict result={current} tokensOnly={tokensOnly} onTokensOnlyChange={setTokensOnly} />
      ) : null}
      <div className={sharePanelRow()}>
        <Button
          size="sm"
          variant="ghost"
          className={sharePanelButton()}
          disabled={text.trim() === "" || check.isPending}
          onClick={runCheck}
        >
          {t("import.check")}
        </Button>
        <Button size="sm" disabled={importable === null} onClick={apply}>
          {t("import.apply")}
        </Button>
      </div>
    </>
  );
}
