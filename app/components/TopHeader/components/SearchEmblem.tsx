"use client";

import { useTranslation } from "react-i18next";

import { LogoIcon } from "../../ui/LogoIcon";
import { searchEmblem, searchEmblemLens, searchEmblemLogo } from "../styles";
import type { SearchEmblemProps } from "../types";

export function SearchEmblem({ onOpen }: SearchEmblemProps) {
  const { t } = useTranslation("components");

  return (
    <button type="button" className={searchEmblem()} aria-label={t("header.search")} onClick={onOpen}>
      <span aria-hidden>
        <LogoIcon className={searchEmblemLogo()} />
      </span>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={3.2}
        strokeLinecap="round"
        className={searchEmblemLens()}
        aria-hidden
      >
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="M15.5 15.5L21 21" />
      </svg>
    </button>
  );
}
