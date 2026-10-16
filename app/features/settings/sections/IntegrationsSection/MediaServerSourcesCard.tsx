"use client";

import { ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { Button } from "@components/ui/Button";
import { cn } from "@utils/cn";
import { PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";

import { SettingsCard } from "../../components/SettingsCard";
import { useSettingsNavigate } from "../../components/SettingsSaveScope";
import { PLAYBACK_SERVER_KEYS } from "../../constants";
import { mediaServerLink, mediaServerLinks, mediaServerMark } from "./styles";
import type { MediaServerSourcesCardProps } from "./types";

export function MediaServerSourcesCard({ connected }: MediaServerSourcesCardProps) {
  const { t } = useTranslation("settings");
  const navigate = useSettingsNavigate();

  return (
    <SettingsCard
      title={t("library.mediaServerSources.title")}
      description={t("library.mediaServerSources.description")}
      anchor="media-server-sources"
    >
      <div className={mediaServerLinks()}>
        {PLAYBACK_SERVER_KEYS.map((server) => (
          <div key={server} className={mediaServerLink()}>
            <span className={cn(mediaServerMark(), providerTone({ provider: server }))}>
              <ProviderMark provider={server} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-medium">{PLAYBACK_SERVER_NAMES[server]}</p>
              <p className="text-fg/50 text-xs">
                {connected[server]
                  ? t("library.mediaServerSources.available")
                  : t("library.mediaServerSources.notConfigured")}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/settings/media?server=${server}`)}>
              {connected[server] ? t("library.mediaServerSources.open") : t("library.mediaServerSources.setUp")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </SettingsCard>
  );
}
