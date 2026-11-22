"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@components/ui/DropdownMenu";
import { MoreVertical } from "lucide-react";
import { useTranslation } from "react-i18next";

import { mobileActionsButton } from "../styles";
import { TRACK_ACTION_META } from "./consts";
import { lockedReason, menuItemBody, trackActionTone } from "./styles";
import type { TrackActionsCellProps } from "./types";

export function TrackActionsCell({ track, actions, onAction }: TrackActionsCellProps) {
  const { t } = useTranslation("requests");

  if (actions.length === 0) {
    return <span className="text-fg/20 block text-right text-xs">-</span>;
  }

  return (
    <div className="flex items-center justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={mobileActionsButton()}
            aria-label={t("tracks.actionsFor", { title: track.title })}
          >
            <MoreVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-w-64">
          {actions.map((action) => {
            const meta = TRACK_ACTION_META[action.id];
            const Icon = meta.icon;
            const locked = action.lock !== null;
            return (
              <DropdownMenuItem
                key={action.id}
                disabled={locked}
                onClick={() => onAction(action.id)}
                className={locked ? undefined : trackActionTone({ tone: meta.tone })}
              >
                <Icon className="size-4" />
                <span className={menuItemBody()}>
                  {t(meta.labelKey)}
                  {action.lock !== null ? (
                    <span className={lockedReason()}>{t(`trackActions.lock.${action.lock}`)}</span>
                  ) : null}
                </span>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
