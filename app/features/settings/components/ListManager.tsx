"use client";

import { Plus, Search, X } from "lucide-react";
import { useMemo, useState, type KeyboardEvent } from "react";

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

const FILTER_THRESHOLD = 5;

interface ListManagerProps {
  value: string[];
  onChange: (next: string[]) => void;
  addPlaceholder?: string;
  filterPlaceholder?: string;
  emptyLabel?: string;
  countLabel?: (count: number) => string;
  helper?: string;
  disabled?: boolean;
}

export function ListManager({
  value,
  onChange,
  addPlaceholder = "Add item...",
  filterPlaceholder = "Filter...",
  emptyLabel = "No items yet.",
  countLabel = (n) => `${n} item${n === 1 ? "" : "s"}`,
  helper,
  disabled,
}: ListManagerProps) {
  const [draft, setDraft] = useState("");
  const [filter, setFilter] = useState("");

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

  const countText = showFilter && filter ? `${filtered.length} of ${value.length}` : countLabel(value.length);

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
          placeholder={addPlaceholder}
          disabled={disabled}
          size="sm"
        />
        <Button type="button" size="sm" variant="outline" onClick={commitAdd} disabled={disabled || !draft.trim()}>
          <Plus className="size-4" />
          Add
        </Button>
      </div>

      {showFilter ? (
        <div className="relative">
          <Search className={listManagerFilterIcon()} />
          <Input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder={filterPlaceholder}
            disabled={disabled}
            size="sm"
            className="pl-9"
          />
        </div>
      ) : null}

      <div className={listManagerListWrap()}>
        {value.length === 0 ? (
          <p className={listManagerEmpty()}>{emptyLabel}</p>
        ) : filtered.length === 0 ? (
          <p className={listManagerEmpty()}>No matches for &ldquo;{filter}&rdquo;.</p>
        ) : (
          filtered.map((item) => (
            <div key={item} className={listManagerRow()}>
              <span className="text-fg truncate">{item}</span>
              <button
                type="button"
                disabled={disabled}
                onClick={() => remove(item)}
                aria-label={`Remove ${item}`}
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
