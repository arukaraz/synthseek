"use client";

import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@components/ui/Dialog";
import { useAlbumDetail, useArtistIdentity } from "@hooks/api/queries/content-detail";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { AlbumDetailBody } from "./components/AlbumDetailBody";
import { ArtistDetailBody } from "./components/ArtistDetailBody";
import { DetailBackButton } from "./components/DetailBackButton";
import { DetailMiniHeader } from "./components/DetailMiniHeader";
import { MINI_HEADER_SCROLL_THRESHOLD } from "./constants";
import { useContentDetail } from "./hooks/useContentDetail";
import { backBar, modalContainer, modalShell } from "./styles";
import type { ContentDetailModalProps } from "./types";

export function ContentDetailModal({ open, onClose, target }: ContentDetailModalProps) {
  const { t } = useTranslation("contentDetail");
  const { current, previous, canGoBack, navigateTo, goBack, handleOpenChange } = useContentDetail({ open, target });
  const shellRef = useRef<HTMLDivElement | null>(null);
  const [miniVisible, setMiniVisible] = useState(false);

  const currentId = current?.id ?? null;
  const isArtist = current?.mode === "artist";
  const { data: identity } = useArtistIdentity({
    deezerArtistId: isArtist ? (current?.id ?? "") : "",
    artistName: current?.artistName ?? "",
    enabled: isArtist,
  });
  const { data: album } = useAlbumDetail({
    deezerAlbumId: !isArtist ? (current?.id ?? "") : "",
    enabled: !!current && !isArtist,
  });

  useEffect(() => {
    setMiniVisible(false);
    if (shellRef.current) shellRef.current.scrollTop = 0;
  }, [currentId]);

  if (!current) return null;

  const heroImage = (isArtist ? identity?.image : album?.cover) ?? current.cover;

  const backLabel = previous ? previous.name : t("backFallback");
  const backAriaLabel = previous ? t("back", { name: previous.name }) : t("backFallback");

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => handleOpenChange(nextOpen, onClose)}>
      <DialogContent className={modalContainer()} aria-describedby="content-detail-description">
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
          ) : (
            <AlbumDetailBody key={current.id} target={current} onNavigate={navigateTo} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
