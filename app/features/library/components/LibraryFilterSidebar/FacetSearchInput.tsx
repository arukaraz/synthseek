"use client";

import { Input } from "@components/ui/Input";
import { useDebouncedDraft } from "@hooks/ui/useDebouncedDraft";
import { useTranslation } from "react-i18next";

import { groupSearch } from "./styles";
import type { FacetSearchInputProps } from "./types";

export function FacetSearchInput({ value, label, onSearch }: FacetSearchInputProps) {
  const { t } = useTranslation("library");
  const [input, setInput] = useDebouncedDraft(value, onSearch);

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
