"use client";

import { Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Popover, PopoverContent, PopoverTrigger } from "@components/ui/Popover";
import { useLocalStorage } from "@hooks/ui/useLocalStorage";

import { TIPS_SEEN_STORAGE_KEY } from "./constants";
import { isSeenTips, parseSeenTips, withSeenTip } from "./helpers";
import { tipAction, tipBadge, tipBody, tipContent, tipHeading } from "./styles";
import type { TipBadgeProps } from "./types";

export function TipBadge({ tipId, body, action }: TipBadgeProps) {
  const { t } = useTranslation("components");
  const [open, setOpen] = useState(false);
  const [seenRaw, setSeenRaw] = useLocalStorage(TIPS_SEEN_STORAGE_KEY, "[]", isSeenTips);
  const seen = parseSeenTips(seenRaw) ?? [];
  const wasSeen = seen.includes(tipId);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next && !wasSeen) setSeenRaw(JSON.stringify(withSeenTip(seen, tipId)));
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button type="button" className={tipBadge({ seen: wasSeen })}>
          <Sparkles aria-hidden />
          {t("tip.label")}
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className={tipContent()}>
        <p className={tipHeading()}>{t("tip.label")}</p>
        <p className={tipBody()}>{body}</p>
        <Link href={action.href} className={tipAction()} onClick={() => setOpen(false)}>
          {action.label} →
        </Link>
      </PopoverContent>
    </Popover>
  );
}
