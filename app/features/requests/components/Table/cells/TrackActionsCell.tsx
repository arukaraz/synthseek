"use client";

import { RequestStatus } from "@api/__generated__/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { IconButton } from "@components/ui/IconButton";
import { isRetryableStatus } from "@utils/status-helpers";
import { ChevronsUp, MoreVertical, RefreshCw, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mobileActionsButton } from "../../styles";
import type { TrackActionsCellProps } from "../types";

export function TrackActionsCell({ item, canAct, onRetry, onCancel, onPrioritize }: TrackActionsCellProps) {
  const { t } = useTranslation("requests");

  if (!canAct) return null;

  const canRetry = isRetryableStatus(item.status);
  const canPrioritize = item.status === RequestStatus.enum.queued && item.priority === 0;

  return (
    <>
      <div className="desktop-only items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        {canRetry && (
          <IconButton
            icon={RefreshCw}
            variant="green"
            size="sm"
            onClick={onRetry}
            aria-label={t("table.retry")}
            title={t("table.retryTitle")}
          />
        )}
        {canPrioritize && (
          <IconButton
            icon={ChevronsUp}
            variant="primary"
            size="sm"
            onClick={onPrioritize}
            aria-label={t("table.prioritizeMenuItem")}
            title={t("table.prioritizeMenuItem")}
          />
        )}
        <IconButton
          icon={Trash2}
          variant="red"
          size="sm"
          onClick={onCancel}
          aria-label={t("table.cancel")}
          title={t("table.cancelTitle")}
        />
      </div>

      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={mobileActionsButton()} aria-label={t("table.actionsMenu")}>
              <MoreVertical className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {canRetry && (
              <DropdownMenuItem onClick={onRetry} className="text-green-400 hover:text-green-300">
                <RefreshCw className="size-4" />
                {t("table.retryMenuItem")}
              </DropdownMenuItem>
            )}
            {canPrioritize && (
              <DropdownMenuItem onClick={onPrioritize} className="text-primary-400 hover:text-primary-300">
                <ChevronsUp className="size-4" />
                {t("table.prioritizeMenuItem")}
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={onCancel} className="text-red-400 hover:text-red-300">
              <Trash2 className="size-4" />
              {t("table.cancelMenuItem")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
