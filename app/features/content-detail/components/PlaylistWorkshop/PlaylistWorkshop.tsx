"use client";

import { SuggestedTracks } from "@components/SuggestedTracks";
import { SegmentTabs } from "@components/ui/SegmentTabs";
import { useReorderPlaylistTracks } from "@hooks/api/mutations/playlists/useReorderPlaylistTracks";
import { useSavePlaylistName } from "@hooks/api/mutations/playlists/useSavePlaylistName";
import { usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useMediaQuery } from "@hooks/ui/useMediaQuery";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { failedToLoad } from "../../helpers";
import { usePlaylistNameDraft } from "../../hooks/usePlaylistNameDraft";
import { usePlaylistOrder } from "../../hooks/usePlaylistOrder";
import { useTrackArtistNavigation } from "../../hooks/useTrackArtistNavigation";
import { WORKSHOP_COLUMNS_QUERY, WORKSHOP_TABS, WORKSHOP_TABS_LAYOUT_ID } from "./constants";
import { totalMinutes, workshopTracks } from "./helpers";
import { workshopBody, workshopError, workshopLoading, workshopPane, workshopScroll, workshopTabs } from "./styles";
import { WorkshopDetails } from "./WorkshopDetails";
import { WorkshopHeader } from "./WorkshopHeader";
import { WorkshopTracks } from "./WorkshopTracks";
import type { PlaylistWorkshopProps, SaveName, SaveOrder, WorkshopTab } from "./types";

export function PlaylistWorkshop({ target, onExit, onClose, onNavigate }: PlaylistWorkshopProps) {
  const { t } = useTranslation("contentDetail");
  const playlistQuery = usePlaylistDetail({ playlistId: target.id, enabled: true });
  const { data: playlist } = playlistQuery;
  const columns = useMediaQuery(WORKSHOP_COLUMNS_QUERY, true);
  const [tab, setTab] = useState<WorkshopTab>("tracks");
  const { playEntity, shuffleEntity, enqueueEntity } = useEntityPlayback();
  const reorder = useReorderPlaylistTracks();
  const savePlaylistName = useSavePlaylistName();
  const openTrackArtist = useTrackArtistNavigation(onNavigate);

  const tracks = useMemo(() => workshopTracks(playlist?.tracks ?? []), [playlist?.tracks]);
  const minutes = useMemo(() => totalMinutes(tracks), [tracks]);
  const inLibrary = playlist?.libraryTrackCount ?? 0;
  const saveName = useCallback<SaveName>(
    (next) => savePlaylistName({ playlistId: target.id, name: next }),
    [savePlaylistName, target.id]
  );
  const nameDraft = usePlaylistNameDraft(playlist?.name ?? target.name, saveName);
  const { shown: name, commit: settleName } = nameDraft;
  const suggestable = playlist?.tracksLock === null;
  const tabs = useMemo(() => WORKSHOP_TABS.filter((value) => suggestable || value !== "suggested"), [suggestable]);
  const shownTab = tabs.includes(tab) ? tab : "tracks";

  const save = useCallback<SaveOrder>(
    (trackIds, settled) => void reorder({ playlistId: target.id, trackIds }).then(settled),
    [reorder, target.id]
  );
  const order = usePlaylistOrder(tracks, save);
  const { commit: settleOrder } = order;
  const settleEdits = useCallback(async () => {
    await settleName();
    await settleOrder();
  }, [settleName, settleOrder]);

  const handlePlay = useCallback(async () => {
    await settleOrder();
    await playEntity({ kind: "playlist", playlistId: target.id });
  }, [settleOrder, playEntity, target.id]);
  const handleShuffle = useCallback(async () => {
    await settleOrder();
    await shuffleEntity({ kind: "playlist", playlistId: target.id });
  }, [settleOrder, shuffleEntity, target.id]);
  const handleEnqueue = useCallback(async () => {
    await settleOrder();
    await enqueueEntity({ kind: "playlist", playlistId: target.id });
  }, [settleOrder, enqueueEntity, target.id]);

  const tracksPane = playlist ? (
    <section className={workshopPane({ role: "tracks" })}>
      <WorkshopTracks
        playlistId={playlist.id}
        order={order}
        lock={playlist.tracksLock}
        onArtistNavigate={openTrackArtist}
      />
    </section>
  ) : null;

  const suggestedPane =
    playlist && suggestable ? (
      <aside className={workshopPane({ role: "suggested" })}>
        <SuggestedTracks playlistId={playlist.id} />
      </aside>
    ) : null;

  const detailsPane = playlist ? (
    <aside className={workshopPane({ role: "details" })}>
      <div className={workshopScroll()}>
        <WorkshopDetails
          playlistId={playlist.id}
          name={name}
          origin={playlist.origin}
          visibility={playlist.visibility}
          sourceProvider={playlist.sourceProvider}
          syncEnabled={playlist.syncEnabled}
          canRename={playlist.nameLock === null}
          nameDraft={nameDraft}
          cover={playlist.cover}
          hasCustomCover={playlist.hasCustomCover}
          canEditTracks={playlist.tracksLock === null}
          limits={playlist.editLimits}
          trackCount={tracks.length}
          minutes={minutes}
          inLibrary={inLibrary}
          settleEdits={settleEdits}
          onDeleted={onClose}
        />
      </div>
    </aside>
  ) : null;

  return (
    <>
      <WorkshopHeader
        name={name}
        cover={playlist?.cover ?? target.cover}
        trackCount={tracks.length}
        minutes={minutes}
        inLibrary={inLibrary}
        onPlay={handlePlay}
        onShuffle={handleShuffle}
        onEnqueue={handleEnqueue}
        onExit={onExit}
      />

      {failedToLoad(playlistQuery) ? (
        <p className={workshopError()}>{t("loadFailed")}</p>
      ) : !playlist ? (
        <div className={workshopLoading()} />
      ) : columns ? (
        <div className={workshopBody()}>
          {detailsPane}
          {tracksPane}
          {suggestedPane}
        </div>
      ) : (
        <>
          <SegmentTabs
            className={workshopTabs()}
            items={tabs.map((value) => ({
              value,
              label: t(`workshop.tabs.${value}`),
              count: value === "tracks" ? tracks.length : undefined,
            }))}
            value={shownTab}
            onValueChange={setTab}
            layoutId={WORKSHOP_TABS_LAYOUT_ID}
            ariaLabel={t("workshop.tabs.label")}
          />
          <div className={workshopBody()}>
            {shownTab === "tracks" ? tracksPane : shownTab === "suggested" ? suggestedPane : detailsPane}
          </div>
        </>
      )}
    </>
  );
}
