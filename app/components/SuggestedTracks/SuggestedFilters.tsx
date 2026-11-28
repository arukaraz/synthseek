"use client";

import { Button } from "@components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { RangeSlider } from "@components/ui/RangeSlider";
import { Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { SUGGESTED_YEAR_FLOOR } from "./constants";
import { filtersYears, sameYears, thumbsFor, yearSpan, yearsAt, yearsLabel } from "./helpers";
import {
  suggestedApply,
  suggestedFilterHead,
  suggestedFilterLabel,
  suggestedFilterPanel,
  suggestedFilterValue,
  suggestedTool,
} from "./styles";
import type { SuggestedFiltersProps } from "./types";

export function SuggestedFilters({ years, saving, onApply }: SuggestedFiltersProps) {
  const { t } = useTranslation("components");
  const span = useMemo(() => yearSpan(SUGGESTED_YEAR_FLOOR), []);
  const [open, setOpen] = useState(false);
  const [thumbs, setThumbs] = useState(() => thumbsFor(years, span));
  const draft = yearsAt(thumbs, span);
  const label = t("suggestedTracks.filters");

  const handleOpenChange = (next: boolean) => {
    if (next) setThumbs(thumbsFor(years, span));
    setOpen(next);
  };

  const apply = () => {
    setOpen(false);
    if (!sameYears(draft, years)) onApply(draft);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={suggestedTool({ active: filtersYears(years) })}
          disabled={saving}
          title={label}
          aria-label={label}
        >
          <Filter className="size-4" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className={suggestedFilterPanel()} aria-label={label}>
        <div className={suggestedFilterHead()}>
          <span className={suggestedFilterLabel()}>{t("suggestedTracks.years.label")}</span>
          <span className={suggestedFilterValue()}>{yearsLabel(draft, t)}</span>
        </div>
        <RangeSlider
          min={span.floor}
          max={span.ceiling}
          low={thumbs.low}
          high={thumbs.high}
          onChange={(low, high) => setThumbs({ low, high })}
          lowLabel={t("suggestedTracks.years.first")}
          highLabel={t("suggestedTracks.years.last")}
        />
        <Button type="button" size="sm" className={suggestedApply()} onClick={apply}>
          {t("suggestedTracks.apply")}
        </Button>
      </PopoverContent>
    </Popover>
  );
}
