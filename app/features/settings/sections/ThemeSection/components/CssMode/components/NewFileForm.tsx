"use client";

import { Plus } from "lucide-react";
import { useRef, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import { NEW_FILE_SUFFIX } from "../constants";
import { newFileProblem } from "../helpers";
import { newFileForm, newFileHint, newFileRow, newFileSuffix, newFileToggle } from "../styles";
import type { NewFileFormProps } from "../types";

export function NewFileForm({ draft, onCreate }: NewFileFormProps) {
  const { t } = useTranslation("themeEditor");
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const toggle = useRef<HTMLButtonElement>(null);
  const problem = newFileProblem(name, draft);
  const bad = name !== "" && problem !== null;

  const close = () => {
    setOpen(false);
    setName("");
    toggle.current?.focus();
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (problem !== null) return;
    onCreate(name);
    close();
  };

  const escape = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    close();
  };

  return (
    <div>
      <button
        ref={toggle}
        type="button"
        aria-expanded={open}
        className={newFileToggle()}
        onClick={() => (open ? close() : setOpen(true))}
      >
        <Plus className="size-3.5 shrink-0" aria-hidden />
        <span>{t("css.newFile")}</span>
      </button>
      {open ? (
        <form className={newFileForm()} onSubmit={submit} onKeyDown={escape}>
          <div className={newFileRow()}>
            <Input
              size="sm"
              value={name}
              autoFocus
              autoComplete="off"
              spellCheck={false}
              aria-label={t("css.newFileName")}
              aria-invalid={bad}
              onChange={(event) => setName(event.target.value)}
            />
            <span className={newFileSuffix()}>{NEW_FILE_SUFFIX}</span>
          </div>
          <p role={problem === "taken" ? "alert" : undefined} className={newFileHint({ bad })}>
            {problem === "taken" ? t("css.newFileTaken") : t("css.newFileHint")}
          </p>
          <Button type="submit" size="sm" variant="secondary" disabled={problem !== null}>
            {t("css.create")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
