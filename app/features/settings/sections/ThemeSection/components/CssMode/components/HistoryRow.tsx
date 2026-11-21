"use client";

import { RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { IconButton } from "@components/ui/IconButton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { formatDateTime } from "@utils/formatters";

import { HISTORY_TOOLTIP_DELAY_MS } from "../constants";
import { historyAction, historyNow, historyRow, historySource, historyWhen } from "../styles";
import type { HistoryRowProps } from "../types";

export function HistoryRow({ version, savedNow, disabled, onRestore }: HistoryRowProps) {
  const { t } = useTranslation("themeEditor");
  const time = formatDateTime(new Date(version.at));
  return (
    <li className={historyRow()}>
      <span className={historyWhen()}>
        {time}
        {savedNow ? <span className={historyNow()}>{t("history.savedNow")}</span> : null}
      </span>
      <span className={historySource()}>{t(`history.sources.${version.source}`)}</span>
      <span className={historyAction()}>
        <TooltipProvider delayDuration={HISTORY_TOOLTIP_DELAY_MS}>
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={disabled ? 0 : undefined} className="inline-flex">
                <IconButton
                  type="button"
                  icon={RotateCcw}
                  animated={false}
                  disabled={disabled}
                  aria-label={t("history.restoreFrom", { time })}
                  onClick={() => onRestore(version)}
                />
              </span>
            </TooltipTrigger>
            <TooltipContent>{disabled ? t("history.alreadyOpen") : t("history.restore")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </span>
    </li>
  );
}
