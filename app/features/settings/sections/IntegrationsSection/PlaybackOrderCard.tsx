"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { useUpdateEnginePlaybackSources } from "@hooks/api/mutations/settings/useUpdateEngine";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { SettingsCard } from "../../components/SettingsCard";
import { movedServer } from "./helpers";
import { orderPosition, orderRow } from "./styles";
import type { PlaybackOrderCardProps } from "./types";

export function PlaybackOrderCard({ order: servers, playing }: PlaybackOrderCardProps) {
  const { t } = useTranslation("settings");
  const update = useUpdateEnginePlaybackSources();

  const move = (index: number, offset: -1 | 1) => update.mutate({ order: movedServer(servers, index, offset) });

  return (
    <SettingsCard title={t("mediaServers.order.title")} description={t("mediaServers.order.description")}>
      <ol className="flex flex-col gap-1.5">
        <li className={orderRow()}>
          <span className={orderPosition()}>1</span>
          <span className="text-fg min-w-0 flex-1 text-sm">{t("mediaServers.order.local")}</span>
        </li>
        {servers.map((server, index) => (
          <li key={server} className={orderRow()}>
            <span className={orderPosition()}>{index + 2}</span>
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm">{PLAYBACK_SERVER_NAMES[server]}</p>
              {playing[server] ? null : <p className="text-fg/50 text-xs">{t("mediaServers.order.notPlaying")}</p>}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => move(index, -1)}
              disabled={index === 0 || update.isPending}
              aria-label={t("mediaServers.order.moveUp", { server: PLAYBACK_SERVER_NAMES[server] })}
            >
              <ArrowUp className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => move(index, 1)}
              disabled={index === servers.length - 1 || update.isPending}
              aria-label={t("mediaServers.order.moveDown", { server: PLAYBACK_SERVER_NAMES[server] })}
            >
              <ArrowDown className="size-4" />
            </Button>
          </li>
        ))}
      </ol>
    </SettingsCard>
  );
}
