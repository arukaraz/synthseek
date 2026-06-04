"use client";

import { cn } from "@utils/cn";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ALBUM_SCOPE_CHOICES, DEFAULT_ALBUM_ARTIST_SCOPE } from "../consts";
import { OptionGrid } from "../OptionGrid";
import type { AlbumScopeChoice, Option } from "../types";
import { ArtistMonitorControl } from "./ArtistMonitorControl";
import { isAlbumScope } from "./helpers";
import { monitorSubGrid } from "./styles";
import type { AlbumMonitorControlProps } from "./types";

export function AlbumMonitorControl({ label, value, onChange }: AlbumMonitorControlProps) {
  const { t } = useTranslation("search");
  const prefersReducedMotion = useReducedMotion();
  const onAlbumScope = isAlbumScope(value);

  const choiceOptions: Option<AlbumScopeChoice["value"]>[] = ALBUM_SCOPE_CHOICES.map((choice) => ({
    value: choice.value,
    label: t(choice.labelKey),
    description: t(choice.descriptionKey),
  }));

  const handleChoiceChange = (choice: AlbumScopeChoice["value"]) => {
    if (choice === "album") {
      onChange("album");
      return;
    }
    if (onAlbumScope) onChange(DEFAULT_ALBUM_ARTIST_SCOPE);
  };

  return (
    <div className="space-y-3">
      <OptionGrid
        label={label}
        options={choiceOptions}
        value={onAlbumScope ? "album" : "entireArtist"}
        onChange={handleChoiceChange}
        columns={2}
        showCheckmark
      />
      <AnimatePresence initial={false}>
        {!onAlbumScope && value !== "album" && (
          <motion.div
            key="album-artist-scope"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.15, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className={cn(monitorSubGrid())}>
              <ArtistMonitorControl label={t("config.fields.lidarrArtistScope")} value={value} onChange={onChange} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
