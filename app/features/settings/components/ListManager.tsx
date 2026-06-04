"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { Input } from "@components/ui/Input";

import {
  fieldHelper,
  listManagerAddRow,
  listManagerCount,
  listManagerEmpty,
  listManagerFilterIcon,
  listManagerListWrap,
  listManagerRemove,
  listManagerRow,
} from "../styles";
import { FILTER_THRESHOLD } from "./constants";
import type { ListManagerProps } from "./types";

export function ListManager({
  value,
  onChange,
  addPlaceholder,
  filterPlaceholder,
  emptyLabel,
  countLabel,
  helper,
  disabled,
}: ListManagerProps) {
  const { t } = useTranslation("settings");
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");

  const resolvedCountLabel = countLabel ?? ((n: number) => t("shell.listManager.count", { count: n }));

  const commitAdd = () => {
    const next = draft.trim();
    if (!next || value.includes(next)) return;
    onChange([...value, next]);
    setDraft("");
  };

  const remove = (item: string) => onChange(value.filter((v) => v !== item));

  const onAddKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitAdd();
    }
  };

  const showFilter = value.length > FILTER_THRESHOLD;
  const filtered = useMemo(() => {
    if (!filter.trim()) return value;
    const needle = filter.trim().toLowerCase();
    return value.filter((v) => v.toLowerCase().includes(needle));
  }, [value, filter]);

  const countText =
    showFilter && filter
      ? t("shell.listManager.filteredCount", { shown: filtered.length, total: value.length })
      : resolvedCountLabel(value.length);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className={listManagerCount()}>{countText}</span>
      </div>

      <div className={listManagerAddRow()}>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onAddKeyDown}
          placeholder={addPlaceholder ?? t("shell.listManager.addPlaceholder")}
          disabled={disabled}
          size="sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={commitAdd} disabled={disabled || !draft.trim()}>
          <Plus className="size-4" />
          {t("shell.listManager.add")}
        </Button>
      </div>

      {showFilter ? (
        <div className="relative">
          <Search className={listManagerFilterIcon()} />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={filterPlaceholder ?? t("shell.listManager.filterPlaceholder")}
            disabled={disabled}
            size="sm"
            className="pl-9"
          />
        </div>
      ) : null}

      <div className={listManagerListWrap()}>
        {value.length === 0 ? (
          <p className={listManagerEmpty()}>{emptyLabel ?? t("shell.listManager.empty")}</p>
        ) : filtered.length === 0 ? (
          <p className={listManagerEmpty()}>{t("shell.listManager.noMatches", { query: filter })}</p>
        ) : (
          filtered.map((item) => (
            <div key={item} className={listManagerRow()}>
              <span className="text-fg truncate">{item}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(item)}
                aria-label={t("shell.listManager.removeLabel", { item })}
                className={listManagerRemove()}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {helper ? <p className={fieldHelper()}>{helper}</p> : null}
    </div>
  );
}
