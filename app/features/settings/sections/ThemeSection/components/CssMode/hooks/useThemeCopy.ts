"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { ThemeCopy, TokenCopy } from "../types";

export function useThemeCopy(): ThemeCopy {
  const { t } = useTranslation("theme");
  return useMemo(() => {
    const tokens: Record<string, TokenCopy> = t("tokens", { returnObjects: true });
    const parts: Record<string, string> = t("parts", { returnObjects: true });
    const snippets: Record<string, string> = t("snippets", { returnObjects: true });
    return { tokens, parts, snippets };
  }, [t]);
}
