"use client";

import { Popover, PopoverAnchor, PopoverContent } from "@components/ui/Popover";
import { X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { addTag, filterTagSuggestions, removeTag } from "./helpers";
import {
  fieldGroup,
  lidarrTagChip,
  lidarrTagChipRemove,
  lidarrTagInputField,
  lidarrTagsField,
  lidarrTagSuggestion,
} from "./styles";
import type { LidarrTagsInputProps } from "./types";

export function LidarrTagsInput({ label, value, onChange, suggestions }: LidarrTagsInputProps) {
  const { t } = useTranslation("search");
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);

  const filteredSuggestions = filterTagSuggestions(suggestions, value, draft);

  const commit = (raw: string) => {
    const next = addTag(value, raw);
    if (next !== value) onChange(next);
    setDraft("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      if (draft.trim().length > 0) commit(draft);
      return;
    }
    if (event.key === "Backspace" && draft.length === 0 && value.length > 0) {
      onChange(removeTag(value, value[value.length - 1]));
    }
  };

  return (
    <div className={fieldGroup()}>
      <label htmlFor={inputId} className="text-fg/90 text-sm font-medium">
        {label}
      </label>
      <Popover open={open && filteredSuggestions.length > 0} onOpenChange={setOpen}>
        <PopoverAnchor asChild>
          <div className={lidarrTagsField()}>
            {value.map((tag) => (
              <span key={tag} className={lidarrTagChip()}>
                {tag}
                <button
                  type="button"
                  className={lidarrTagChipRemove()}
                  onClick={() => onChange(removeTag(value, tag))}
                  aria-label={t("config.lidarr.tags.remove", { tag })}
                >
                  <X className="size-3" />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              id={inputId}
              className={lidarrTagInputField()}
              value={draft}
              placeholder={value.length === 0 ? t("config.lidarr.tags.placeholder") : ""}
              onChange={(event) => {
                setDraft(event.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={handleKeyDown}
              aria-label={label}
              autoComplete="off"
            />
          </div>
        </PopoverAnchor>
        <PopoverContent
          align="start"
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="max-h-56 w-(--radix-popover-trigger-width) space-y-0.5 overflow-y-auto p-1"
        >
          {filteredSuggestions.map((suggestion) => (
            <button key={suggestion} type="button" className={lidarrTagSuggestion()} onClick={() => commit(suggestion)}>
              {suggestion}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}
