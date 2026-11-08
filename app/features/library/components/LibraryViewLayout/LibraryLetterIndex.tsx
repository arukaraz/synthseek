"use client";

import { AlphabetIndex } from "@components/ui/AlphabetIndex";
import { useTranslation } from "react-i18next";

import { useGridJump } from "../../hooks/useGridJump";
import type { LibraryLetterIndexProps } from "./types";

export function LibraryLetterIndex({ index, scrollRoot }: LibraryLetterIndexProps) {
  const { t } = useTranslation("library");
  const jump = useGridJump(scrollRoot, index.loadThrough);

  return (
    <AlphabetIndex
      entries={index.entries}
      descending={index.descending}
      label={t("page.shelf.letterIndex")}
      letterLabel={(letter) => t("page.shelf.jumpToLetter", { letter })}
      onSelect={(entry) => void jump(entry.offset)}
      className="sm:hidden"
    />
  );
}
