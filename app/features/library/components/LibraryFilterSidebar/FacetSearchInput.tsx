"use client";

import { Input } from "@components/ui/Input";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { groupSearch } from "./styles";
import type { FacetSearchInputProps } from "./types";

export function FacetSearchInput({ value, label, onSearch }: FacetSearchInputProps) {
  const { t } = useTranslation("library");
  const [input, setInput] = useState(value);
  const debounced = useDebounce(input, { delay: 300 });

  useEffect(() => {
    setInput(value);
  }, [value]);

  useEffect(() => {
    if (debounced !== value) {
      onSearch(debounced);
    }
  }, [debounced, value, onSearch]);

  return (
    <Input
      size="sm"
      value={input}
      onChange={(event) => setInput(event.target.value)}
      placeholder={t("page.facets.searchPlaceholder")}
      className={groupSearch()}
      aria-label={label}
    />
  );
}
