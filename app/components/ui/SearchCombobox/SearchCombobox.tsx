"use client";

import { Search } from "lucide-react";
import { useId, useState } from "react";
import type { KeyboardEvent } from "react";

import { Input } from "@components/ui/Input";

import { comboEmpty, comboHint, comboIcon, comboInput, comboLabel, comboList, comboOption, comboRoot } from "./styles";
import type { SearchComboboxOption, SearchComboboxProps } from "./types";

export function SearchCombobox({
  label,
  placeholder,
  options,
  query,
  onQueryChange,
  onPick,
  emptyText,
  loading = false,
}: SearchComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const showing = open && (options.length > 0 || (query.trim().length > 0 && !loading && emptyText !== undefined));

  const pick = (option: SearchComboboxOption) => {
    onPick(option);
    onQueryChange("");
    setActive(0);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && open) {
      event.stopPropagation();
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActive((current) => (options.length === 0 ? 0 : (current + step + options.length) % options.length));
      return;
    }
    const option = options[active];
    if (event.key === "Enter" && showing && option) {
      event.preventDefault();
      pick(option);
    }
  };

  return (
    <div className={comboRoot()}>
      <Search className={comboIcon()} aria-hidden />
      <Input
        role="combobox"
        autoComplete="off"
        aria-label={label}
        aria-expanded={showing}
        aria-controls={listId}
        aria-activedescendant={showing && options[active] ? `${listId}-${active}` : undefined}
        placeholder={placeholder}
        className={comboInput()}
        value={query}
        onChange={(event) => {
          onQueryChange(event.target.value);
          setActive(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
      />
      <div id={listId} role="listbox" aria-label={label} hidden={!showing} className={comboList()}>
        {options.map((option, index) => (
          <button
            key={option.value}
            id={`${listId}-${index}`}
            type="button"
            role="option"
            aria-selected={index === active}
            tabIndex={-1}
            className={comboOption({ active: index === active })}
            onMouseDown={(event) => event.preventDefault()}
            onMouseEnter={() => setActive(index)}
            onClick={() => pick(option)}
          >
            <span className={comboLabel()}>{option.label}</span>
            {option.hint ? <span className={comboHint()}>{option.hint}</span> : null}
          </button>
        ))}
        {options.length === 0 ? <span className={comboEmpty()}>{emptyText}</span> : null}
      </div>
    </div>
  );
}
