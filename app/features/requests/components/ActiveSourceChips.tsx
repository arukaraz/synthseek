"use client";

import { ContentType } from "@api/__generated__/types";
import { useTrackRequests } from "@hooks/api";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { Disc, ListMusic, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { deriveSourceOptions, parseSourceIds, serializeSourceIds } from "../helpers";
import { REQUESTS_URL_PARAMS } from "../types";
import { activeSourceChip, activeSourceChipClear, activeSourceClearAll } from "./styles";

export function ActiveSourceChips() {
  const { t } = useTranslation("requests");
  const { data: items } = useTrackRequests();
  const [raw, setSource] = useUrlParam("source", REQUESTS_URL_PARAMS.source);

  const selectedIds = parseSourceIds(raw);
  if (selectedIds.length === 0) return null;

  const selected = deriveSourceOptions(items).filter((option) => selectedIds.includes(option.id));
  if (selected.length === 0) return null;

  const remove = (id: string) => setSource(serializeSourceIds(selectedIds.filter((entry) => entry !== id)));

  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <span className="text-fg/40 text-xs">{t("activeSourceChips.filteredTo")}</span>
      {selected.map((option) => {
        const isAlbum = option.contentType === ContentType.enum.album;
        const Icon = isAlbum ? Disc : ListMusic;
        return (
          <span key={option.id} className={activeSourceChip()}>
            <Icon className={cn("size-3.5 shrink-0", isAlbum ? "type-text-album" : "type-text-playlist")} />
            <span className="text-fg/80 max-w-[16rem] truncate">{option.name}</span>
            <button
              type="button"
              onClick={() => remove(option.id)}
              aria-label={t("activeSourceChips.remove", { name: option.name })}
              className={activeSourceChipClear()}
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}
      {selected.length > 1 && (
        <button type="button" onClick={() => setSource(null)} className={activeSourceClearAll()}>
          {t("activeSourceChips.clearAll")}
        </button>
      )}
    </div>
  );
}
