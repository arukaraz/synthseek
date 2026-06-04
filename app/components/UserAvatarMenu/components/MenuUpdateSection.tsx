"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PATCH_NOTES_URL } from "@utils/version";

import {
  patchNotesLink,
  updateBreakingPrefix,
  updateCurrent,
  updateGlyph,
  updateSection,
  updateStatusRow,
  updateTitle,
} from "../styles";
import type { MenuUpdateSectionProps } from "../types";

export function MenuUpdateSection({ latestVersion, currentVersion, breaking }: MenuUpdateSectionProps) {
  const { t } = useTranslation("components");
  const tone = breaking ? "breaking" : "info";

  return (
    <div className={updateSection({ tone })}>
      <div className={updateStatusRow()}>
        {breaking ? (
          <motion.span
            className={updateGlyph({ tone })}
            animate={{ opacity: [1, 0.6, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            <AlertTriangle className="h-4 w-4" />
          </motion.span>
        ) : (
          <ArrowUpCircle aria-hidden className={updateGlyph({ tone })} />
        )}

        <span className={updateTitle()}>
          {breaking ? <span className={updateBreakingPrefix()}>{t("userMenu.majorUpdate")}</span> : null}
          {t("userMenu.updateTo", { version: latestVersion })}
        </span>

        <span className={updateCurrent()}>{t("userMenu.currentVersion", { version: currentVersion })}</span>
      </div>

      <a
        href={PATCH_NOTES_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("userMenu.patchNotes")}
        className={patchNotesLink()}
      >
        {t("userMenu.patchNotes")}
      </a>
    </div>
  );
}
