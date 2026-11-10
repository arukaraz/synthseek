"use client";

import { Check, ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

import { Input } from "@components/ui/Input";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { selectMenuLabel, selectMenuTrigger, selectMenuValue } from "@components/ui/SelectMenu/styles";
import { stepIndex } from "@utils/list-navigation";

import { filterOptions } from "./helpers";
import {
  searchSelectCheck,
  searchSelectChevron,
  searchSelectContent,
  searchSelectEmpty,
  searchSelectField,
  searchSelectIcon,
  searchSelectInput,
  searchSelectList,
  searchSelectOption,
  searchSelectOptionDescription,
  searchSelectOptionLabel,
  searchSelectOptionText,
} from "./styles";
import type { SearchSelectProps } from "./types";

export function SearchSelect<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
  searchPlaceholder,
  emptyText,
  placeholder,
  disabled = false,
}: SearchSelectProps<T>) {
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const current = options.find((option) => String(option.value) === String(value));
  const shown = useMemo(() => filterOptions(options, query), [options, query]);
  const activeOption = shown[active];

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) return;
    setQuery("");
    setActive(
      Math.max(
        0,
        options.findIndex((option) => String(option.value) === String(value))
      )
    );
  };

  const pick = (next: T) => {
    onChange(next);
    setOpen(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => stepIndex(index, event.key === "ArrowDown" ? 1 : -1, shown.length));
      return;
    }
    if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      pick(activeOption.value);
    }
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={selectMenuTrigger()} disabled={disabled} aria-label={ariaLabel}>
          <span className={selectMenuValue()}>
            <span className={selectMenuLabel()}>{current ? current.label : placeholder}</span>
          </span>
          <ChevronDown className={searchSelectChevron()} aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={searchSelectContent()}>
        <div className={searchSelectField()}>
          <Search className={searchSelectIcon()} aria-hidden />
          <Input
            role="combobox"
            autoComplete="off"
            aria-label={searchPlaceholder}
            aria-expanded
            aria-controls={listId}
            aria-activedescendant={activeOption ? `${listId}-${active}` : undefined}
            placeholder={searchPlaceholder}
            className={searchSelectInput()}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        <div ref={listRef} id={listId} role="listbox" aria-label={ariaLabel} className={searchSelectList()}>
          {shown.map((option, index) => {
            const selected = String(option.value) === String(value);
            return (
              <button
                key={String(option.value)}
                id={`${listId}-${index}`}
                data-index={index}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={-1}
                className={searchSelectOption({ active: index === active })}
                onMouseEnter={() => setActive(index)}
                onClick={() => pick(option.value)}
              >
                <span className={searchSelectOptionText()}>
                  <span className={searchSelectOptionLabel()}>{option.label}</span>
                  {option.description ? (
                    <span className={searchSelectOptionDescription()}>{option.description}</span>
                  ) : null}
                </span>
                {selected ? <Check className={searchSelectCheck()} aria-hidden /> : null}
              </button>
            );
          })}
          {shown.length === 0 ? <span className={searchSelectEmpty()}>{emptyText}</span> : null}
        </div>
      </PopoverContent>
    </Popover>
  );
}
