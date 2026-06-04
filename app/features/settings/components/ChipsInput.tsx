"use client";

import { X } from "lucide-react";
import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@components/ui/Input";
import { cn } from "@utils/cn";

import { chipsInputChip, chipsInputInputField, chipsInputRoot } from "../styles";
import type { ChipsInputProps } from "./types";

export function ChipsInput({ value, onChange, placeholder, disabled }: ChipsInputProps) {
  const { t } = useTranslation("settings");
  const [draft, setDraft] = useState("");

  const commit = (raw: string) => {
    const next = raw.trim();
    if (!next || value.includes(next)) return;
    onChange([...value, next]);
    setDraft("");
  };

  const remove = (chip: string) => onChange(value.filter((v) => v !== chip));

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit(draft);
      return;
    }
    if (e.key === "Backspace" && draft === "" && value.length > 0) {
      e.preventDefault();
      const last = value[value.length - 1];
      if (last !== undefined) remove(last);
    }
  };

  return (
    <div className={cn(chipsInputRoot(), disabled && "opacity-60")}>
      {value.map((chip) => (
        <span key={chip} className={chipsInputChip()}>
          {chip}
          <button
            type="button"
            disabled={disabled}
            onClick={() => remove(chip)}
            aria-label={t("shell.chipsInput.removeLabel", { chip })}
            className="hover:text-primary-100"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => commit(draft)}
        placeholder={value.length === 0 ? placeholder : undefined}
        disabled={disabled}
        className={chipsInputInputField()}
      />
    </div>
  );
}
