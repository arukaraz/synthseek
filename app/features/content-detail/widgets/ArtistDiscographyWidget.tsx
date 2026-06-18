"use client";

import { SegmentTabs } from "@components/ui/SegmentTabs";
import type { SegmentTabItem } from "@components/ui/SegmentTabs";
import { useArtistDiscography } from "@hooks/api/queries/content-detail";
import { memo, useState } from "react";
import { useTranslation } from "react-i18next";

import { RECORD_TYPE_LABEL_KEY } from "../components/Discography/constants";
import { Discography } from "../components/Discography";
import { orderedGroups } from "../components/Discography/helpers";
import type { DiscographyGroup, DiscographyRecordType } from "../components/Discography/types";
import { DetailEmpty, DetailSection } from "../components/DetailSection";
import { albumTarget } from "../helpers";
import type { ArtistDiscographyWidgetProps, ContentCardItem } from "../types";

function ArtistDiscographyWidgetComponent({ deezerArtistId, artistName, onSelectAlbum }: ArtistDiscographyWidgetProps) {
  const { t } = useTranslation("contentDetail");
  const { data, isLoading } = useArtistDiscography({ deezerArtistId });

  const groups: DiscographyGroup[] = (data?.groups ?? []).map((group) => ({
    recordType: group.recordType,
    albums: group.albums.map((album) => ({
      id: album.externalId,
      title: album.title,
      subtitle: null,
      image: album.image,
      inLibrary: album.inLibrary,
      libraryTrackCount: album.libraryTrackCount,
      totalTracks: album.totalTracks,
    })),
  }));

  const visibleGroups = orderedGroups(groups);
  const [active, setActive] = useState<DiscographyRecordType>(visibleGroups[0]?.recordType ?? "album");
  const activeGroup = visibleGroups.find((group) => group.recordType === active) ?? visibleGroups[0];
  const totalCount = visibleGroups.reduce((sum, group) => sum + group.albums.length, 0);

  const handleSelect = (item: ContentCardItem) => {
    onSelectAlbum(albumTarget({ id: item.id, name: item.title, artistName, cover: item.image }));
  };

  const tabs: SegmentTabItem<DiscographyRecordType>[] = visibleGroups.map((group) => ({
    value: group.recordType,
    label: t(RECORD_TYPE_LABEL_KEY[group.recordType]),
    count: group.albums.length,
  }));

  const inlineSlot =
    visibleGroups.length > 1 ? (
      <SegmentTabs
        items={tabs}
        value={active}
        onValueChange={setActive}
        layoutId="discography-tabs"
        ariaLabel={t("sections.discography")}
      />
    ) : undefined;

  return (
    <DetailSection
      title={t("sections.discography")}
      isLoading={isLoading}
      skeletonHeight="h-56"
      count={visibleGroups.length > 0 ? totalCount : undefined}
      inlineSlot={inlineSlot}
    >
      {activeGroup ? (
        <Discography albums={activeGroup.albums} onSelectAlbum={handleSelect} />
      ) : (
        <DetailEmpty message={t("empty.discography")} />
      )}
    </DetailSection>
  );
}

export const ArtistDiscographyWidget = memo(ArtistDiscographyWidgetComponent);
