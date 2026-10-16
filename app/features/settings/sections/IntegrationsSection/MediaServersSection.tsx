"use client";

import { HardDrive } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { ProviderMark, providerTone } from "@components/LibrarySourceModal";
import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useUpdateEnginePlaybackSources } from "@hooks/api/mutations/settings/useUpdateEngine";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { isPlaybackServerKey, PLAYBACK_SERVER_NAMES } from "@utils/playback-servers";
import type { PlaybackServerKey } from "@utils/playback-servers";

import { ChainPanel, OrderedChain, chainColumn, chainLayout } from "../../components/OrderedChain";
import { SaveBar } from "../../components/SaveBar";
import { SaveLabelProvider } from "../../components/SettingsSaveScope";
import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { serverChainStatus, serverConnections } from "../../helpers";
import { contentRoot, emptyPanel } from "../../styles";
import { PLAYBACK_CHAIN_SELECTIONS } from "./constants";
import { sameOrder } from "./helpers";
import { JellyfinCard } from "./JellyfinCard";
import { LocalPlaybackCard } from "./LocalPlaybackCard";
import { NavidromeCard } from "./NavidromeCard";
import { PlexIntegrationCard } from "./PlexIntegrationCard";
import { chainMark } from "./styles";

export function MediaServersSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.media;
  const { data, isLoading, error } = useSettings();
  const updateOrder = useUpdateEnginePlaybackSources();
  const [selected, setSelected] = useUrlParam("server", { validValues: PLAYBACK_CHAIN_SELECTIONS });
  const [draftOrder, setDraftOrder] = useState<PlaybackServerKey[] | null>(null);

  const header = <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />;

  if (isLoading) {
    return (
      <div className={contentRoot()}>
        {header}
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">{t("common.loading")}</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={contentRoot()}>
        {header}
        <div className={emptyPanel()}>
          <span className="text-destructive-vivid text-sm">{t("common.loadFailed")}</span>
        </div>
      </div>
    );
  }

  const { plex, navidrome, jellyfin } = data.connections;
  const connected = serverConnections(data.connections);
  const savedOrder = data.engine.playbackSources.order;
  const order = draftOrder ?? savedOrder;
  const active = selected ?? "local";
  const hiddenUnless = (key: string) => key !== active;

  return (
    <div className={contentRoot()}>
      {header}
      <div className={chainLayout()}>
        <div className={chainColumn()} data-anchor-target="playback-order">
          <OrderedChain
            label={t("mediaServers.order.title")}
            labelTrailing={<InfoTooltip description={t("mediaServers.order.description")} />}
            fixed={[
              {
                key: "local",
                title: t("mediaServers.order.local"),
                status: null,
                mark: (
                  <span className={chainMark()}>
                    <HardDrive className="size-3.5" />
                  </span>
                ),
              },
            ]}
            entries={order.map((server) => ({
              key: server,
              title: PLAYBACK_SERVER_NAMES[server],
              status: serverChainStatus(connected[server]),
              mark: (
                <span className={cn(chainMark(), providerTone({ provider: server }))}>
                  <ProviderMark provider={server} size={15} />
                </span>
              ),
            }))}
            selected={active}
            onSelect={setSelected}
            onReorder={(next) => {
              const servers = next.filter(isPlaybackServerKey);
              setDraftOrder(sameOrder(servers, savedOrder) ? null : servers);
            }}
            hint={t("mediaServers.order.hint")}
          />
          <SaveLabelProvider label={t("mediaServers.order.title")}>
            <SaveBar
              isDirty={draftOrder !== null}
              isSaving={updateOrder.isPending}
              onSave={async () => {
                if (draftOrder === null) return;
                await updateOrder.mutateAsync({ order: draftOrder });
                setDraftOrder(null);
              }}
              onCancel={() => setDraftOrder(null)}
            />
          </SaveLabelProvider>
        </div>

        <ChainPanel label={t("mediaServers.panelLabel")}>
          <div hidden={hiddenUnless("local")}>
            <LocalPlaybackCard />
          </div>
          <div hidden={hiddenUnless("plex")}>
            <PlexIntegrationCard
              initial={{ connection: plex, behavior: data.engine.plexBehavior, naming: data.formatting }}
            />
          </div>
          <div hidden={hiddenUnless("navidrome")}>
            <NavidromeCard initial={navidrome} />
          </div>
          <div hidden={hiddenUnless("jellyfin")}>
            <JellyfinCard initial={jellyfin} />
          </div>
        </ChainPanel>
      </div>
    </div>
  );
}
