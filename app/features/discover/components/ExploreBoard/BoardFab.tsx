"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import { resolveToastMobileOffset, resolveToastOffset } from "@components/ui/Toaster/helpers";
import { toastOffsetVars } from "@components/ui/Toaster/styles";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@components/ui/Tooltip";
import { useDockJobs } from "@hooks/api/subscriptions";
import { usePlayerBottomDock } from "@hooks/ui/player";

import { CustomizeIcon } from "./CustomizeIcon";
import { boardDock, boardFab } from "./styles";
import type { BoardFabProps } from "./types";

export function BoardFab({ editing, onCustomize, onDone }: BoardFabProps) {
  const { t } = useTranslation("discover");
  const dockVisible = useDockJobs().length > 0;
  const playerDock = usePlayerBottomDock();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const label = editing ? t("board.done") : t("board.customize");

  useEffect(() => setHost(document.body), []);

  if (!host) return null;

  return createPortal(
    <div
      data-board-dock
      className={boardDock()}
      style={toastOffsetVars(resolveToastMobileOffset(dockVisible), resolveToastOffset(dockVisible, playerDock))}
    >
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={boardFab({ editing })}
              aria-label={label}
              onClick={editing ? onDone : onCustomize}
            >
              {editing ? <Check /> : <CustomizeIcon />}
            </button>
          </TooltipTrigger>
          <TooltipContent side="left">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>,
    host
  );
}
