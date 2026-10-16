"use client";

import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { DownloadSourceKey } from "@api/__generated__/types";
import { useUpdateDownloadSourceOrder } from "@hooks/api/mutations/settings/useDownloadSources";
import { useDownloadSourcesAvailability } from "@hooks/api/queries/useDownloadSourcesAvailability";
import { useLidarrStatus } from "@hooks/api/queries/useLidarrStatus";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useSlskdStatus } from "@hooks/api/queries/useSlskdStatus";
import { useUrlParam } from "@hooks/ui/useUrlParam";

import {
  ChainItem,
  ChainPanel,
  OrderedChain,
  chainColumn,
  chainLabel,
  chainLayout,
  chainList,
  chainNumber,
} from "../../components/OrderedChain";
import { SaveBar } from "../../components/SaveBar";
import { SaveLabelProvider } from "../../components/SettingsSaveScope";
import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID, SOURCE_TITLE_KEYS } from "../../constants";
import { lidarrChainStatus, sourceChainStatus, sourceOrderOf } from "../../helpers";
import { contentRoot, emptyPanel } from "../../styles";
import { ArchiveCard } from "./ArchiveCard";
import { CHAIN_SELECTIONS } from "./constants";
import { sameOrder } from "./helpers";
import { LidarrCard } from "./LidarrCard";
import { SlskdCard } from "./SlskdCard";
import { SoundcloudCard } from "./SoundcloudCard";
import { SubsonicSourceCard } from "./SubsonicSourceCard";
import { TorrentCard } from "./TorrentCard";
import { UsenetCard } from "./UsenetCard";
import { YtdlpCard } from "./YtdlpCard";

export function DownloadSourcesSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.downloadSources;
  const { data, isLoading, error } = useSettings();
  const availability = useDownloadSourcesAvailability();
  const slskd = useSlskdStatus();
  const lidarr = useLidarrStatus();
  const updateOrder = useUpdateDownloadSourceOrder();
  const [selected, setSelected] = useUrlParam("source", { validValues: CHAIN_SELECTIONS });
  const [draftOrder, setDraftOrder] = useState<DownloadSourceKey[] | null>(null);

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
          <span className="text-sm text-red-400">
            {t("common.loadFailedWithReason", { reason: error?.message ?? t("common.unknownError") })}
          </span>
        </div>
      </div>
    );
  }

  const savedOrder = sourceOrderOf(data.downloadSources);
  const order = draftOrder ?? savedOrder;
  const active = selected ?? order[0];
  const hiddenUnless = (key: string) => key !== active;

  return (
    <div className={contentRoot()}>
      {header}
      <div className={chainLayout()}>
        <div className={chainColumn()} data-anchor-target="search-order">
          <OrderedChain
            label={t("shell.downloadSources.order")}
            entries={order.map((key) => ({
              key,
              title: t(SOURCE_TITLE_KEYS[key]),
              status: sourceChainStatus(key, data.downloadSources, availability.data, slskd.data?.status),
            }))}
            selected={active}
            onSelect={setSelected}
            onReorder={(next) => setDraftOrder(sameOrder(next, savedOrder) ? null : next)}
            hint={t("shell.downloadSources.orderHint")}
          />
          <div className="flex flex-col">
            <div className={chainLabel()}>{t("shell.downloadSources.handOff")}</div>
            <ol className={chainList()}>
              <ChainItem
                entry={{ key: "lidarr", title: t("lidarr.title"), status: lidarrChainStatus(lidarr.data?.status) }}
                badge={
                  <span className={chainNumber({ selected: active === "lidarr" })}>
                    <ArrowUpRight className="size-3.5" />
                  </span>
                }
                selected={active === "lidarr"}
                reorderable={false}
                onSelect={() => setSelected("lidarr")}
              />
            </ol>
          </div>
          <SaveLabelProvider label={t("shell.downloadSources.order")}>
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

        <ChainPanel label={t("shell.downloadSources.panelLabel")}>
          <div hidden={hiddenUnless("slskd")}>
            <SlskdCard
              initial={{
                connection: data.connections.slskd,
                search: data.engine.search,
                timeouts: data.engine.timeouts,
              }}
            />
          </div>
          <div hidden={hiddenUnless("subsonic")}>
            <SubsonicSourceCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("usenet")}>
            <UsenetCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("torrent")}>
            <TorrentCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("ytdlp")}>
            <YtdlpCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("soundcloud")}>
            <SoundcloudCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("archive")}>
            <ArchiveCard initial={data.downloadSources} />
          </div>
          <div hidden={hiddenUnless("lidarr")}>
            <LidarrCard initial={data.connections.lidarr} />
          </div>
        </ChainPanel>
      </div>
    </div>
  );
}
