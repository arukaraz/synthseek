"use client";

import { motion } from "framer-motion";
import { AlertTriangle, ArrowUpCircle } from "lucide-react";

import { PATCH_NOTES_URL } from "@utils/version";

import { MENU_COPY } from "../constants";
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
          {breaking ? <span className={updateBreakingPrefix()}>{MENU_COPY.majorUpdate}</span> : null}
          Update to {latestVersion}
        </span>

        <span className={updateCurrent()}>Current {currentVersion}</span>
      </div>

      <a
        href={PATCH_NOTES_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={MENU_COPY.patchNotes}
        className={patchNotesLink()}
      >
        {MENU_COPY.patchNotes}
      </a>
    </div>
  );
}
