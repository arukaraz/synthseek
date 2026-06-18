"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useAlbumDetail, useArtistIdentity, usePlaylistDetail } from "@hooks/api/queries/content-detail";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AlbumDetailBody } from "./components/AlbumDetailBody";
import { ArtistDetailBody } from "./components/ArtistDetailBody";
import { DetailBackButton } from "./components/DetailBackButton";
import { DetailMiniHeader } from "./components/DetailMiniHeader";
import { PlaylistDetailBody } from "./components/PlaylistDetailBody";
import { ContentDetailActionsProvider } from "./ContentDetailActionsContext";
import { MINI_HEADER_SCROLL_THRESHOLD } from "./constants";
import { useContentDetail } from "./hooks/useContentDetail";
import { backBar, modalContainer, modalShell } from "./styles";
import type { ContentDetailModalProps } from "./types";

export function ContentDetailModal({ open, onClose, target, actions }: ContentDetailModalProps) {
  const { t } = useTranslation("contentDetail");
  const { current, previous, canGoBack, navigateTo, goBack, handleOpenChange } = useContentDetail({ open, target });
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [miniVisible, setMiniVisible] = useState(false);

  const currentId = current?.id ?? null;
  const isArtist = current?.mode === "artist";
  const isAlbum = current?.mode === "album";
  const isPlaylist = current?.mode === "playlist";
  const { data: identity } = useArtistIdentity({
    deezerArtistId: isArtist ? (current?.id ?? "") : "",
    artistName: current?.artistName ?? "",
    enabled: isArtist,
  });
  const { data: album } = useAlbumDetail({
    deezerAlbumId: isAlbum ? (current?.id ?? "") : "",
    enabled: !!current && isAlbum,
  });
  const isLibraryPlaylist =
    isPlaylist && (current?.playlistSource ?? (current?.preloadedTracks ? "preloaded" : "library")) === "library";
  const { data: playlist } = usePlaylistDetail({
    playlistId: isLibraryPlaylist ? (current?.id ?? "") : "",
    enabled: !!current && isLibraryPlaylist,
  });

  useEffect(() => {
    setMiniVisible(false);
    if (shellRef.current) shellRef.current.scrollTop = 0;
  }, [currentId]);

  if (!current) return null;

  const heroImage = (isArtist ? identity?.image : isPlaylist ? playlist?.cover : album?.cover) ?? current.cover;

  const backLabel = previous ? previous.name : t("backFallback");
  const backAriaLabel = previous ? t("back", { name: previous.name }) : t("backFallback");

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onClose)}>
      <DialogContent className={modalContainer()} aria-describedby="content-detail-description">
        <ContentDetailActionsProvider actions={actions}>
          <DialogTitle className="sr-only">{t("dialogTitle", { name: current.name })}</DialogTitle>
          <DialogDescription id="content-detail-description" className="sr-only">
            {t("dialogDescription", { name: current.name })}
          </DialogDescription>

          <div
            ref={shellRef}
            className={modalShell()}
            onScroll={(event) => setMiniVisible(event.currentTarget.scrollTop > MINI_HEADER_SCROLL_THRESHOLD)}
          >
            <DetailMiniHeader
              name={current.name}
              cover={heroImage}
              mode={current.mode}
              canGoBack={canGoBack}
              onBack={goBack}
              backAriaLabel={backAriaLabel}
              visible={miniVisible}
            />

            {canGoBack ? (
              <div className={backBar()}>
                <DetailBackButton label={backLabel} ariaLabel={backAriaLabel} onClick={goBack} />
              </div>
            ) : null}

            {current.mode === "artist" ? (
              <ArtistDetailBody key={current.id} target={current} onNavigate={navigateTo} />
            ) : current.mode === "playlist" ? (
              <PlaylistDetailBody key={current.id} target={current} />
            ) : (
              <AlbumDetailBody key={current.id} target={current} onNavigate={navigateTo} />
            )}
          </div>
        </ContentDetailActionsProvider>
      </DialogContent>
    </Dialog>
  );
}
