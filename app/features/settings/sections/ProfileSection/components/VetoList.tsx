"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { SearchCombobox } from "@components/ui/SearchCombobox";

import { vetoBlock, vetoLabel, vetoTag, vetoTagList, vetoTagText } from "../styles";
import type { VetoListProps } from "../types";

export function VetoList({
  label,
  placeholder,
  entries,
  options,
  query,
  onQueryChange,
  onAdd,
  onRemove,
}: VetoListProps) {
  const { t } = useTranslation("settings");

  return (
    <div className={vetoBlock()}>
      <span className={vetoLabel()}>{label}</span>
      {entries.length > 0 ? (
        <div className={vetoTagList()}>
          {entries.map((entry) => (
            <span key={entry.value} className={vetoTag()}>
              <span className={vetoTagText()}>{entry.label}</span>
              <IconButton
                icon={X}
                size="sm"
                animated={false}
                aria-label={t("neverInclude.remove", { name: entry.label })}
                onClick={() => onRemove(entry.value)}
              />
            </span>
          ))}
        </div>
      ) : null}
      <SearchCombobox
        label={placeholder}
        placeholder={placeholder}
        options={options}
        query={query}
        onQueryChange={onQueryChange}
        onPick={(option) => onAdd(option.value)}
        emptyText={t("neverInclude.noMatch")}
      />
    </div>
  );
}
