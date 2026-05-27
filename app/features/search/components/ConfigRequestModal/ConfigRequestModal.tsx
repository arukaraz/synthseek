"use client";

import { Button } from "@components/ui/Button";
import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog";
import {
  ContentType,
  RequestFormat,
  RequestMatchingMode,
  FORMAT_OPTIONS,
  type MusicPlaylistTrack,
  type MusicTrack,
} from "@api/__generated__/types";
import { useBatchRequest, useGetContents, usePlaylistRequest, useRequest } from "@hooks/api";
import { primaryGradientButton } from "@theme/utilities/styles";
import { titleCase } from "@utils/formatters";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfigHeader } from "./ConfigHeader";
import { OptionGrid } from "./OptionGrid";
import { BITRATE_OPTIONS, MATCHING_OPTIONS } from "./consts";
import { extractItemMetadata, getItemDisplayName, mapTrackFields } from "./helpers";
import type { ConfigRequestModalProps, Option } from "./types";

export default function ConfigRequestModal({
  isOpen,
  onClose,
  item,
  itemType,
  onSuccess,
  parentAlbum,
}: ConfigRequestModalProps) {
  const [bitrate, setBitrate] = useState(320);
  const [format, setFormat] = useState<RequestFormat>(RequestFormat.enum.mp3);
  const [bitrateMatching, setBitrateMatching] = useState<RequestMatchingMode>(RequestMatchingMode.enum.flexible);
  const formatMatching = RequestMatchingMode.enum.flexible;

  const router = useRouter();

  const needsTrackList = !!item && item.type !== ContentType.enum.track;
  const { data: contentResponse, isLoading: isLoadingTracks } = useGetContents(
    item?.id ?? "",
    needsTrackList,
    item?.type ?? ContentType.enum.album
  );

  const trackList = useMemo<MusicTrack[]>(() => {
    if (!contentResponse?.success || !contentResponse.content) return [];
    const content = Array.isArray(contentResponse.content) ? contentResponse.content : [];
    if (item?.type === ContentType.enum.playlist) {
      const playlistTracks = content as MusicPlaylistTrack[];
      return playlistTracks.filter((pt) => pt?.track).map((pt) => pt.track);
    }
    return content as MusicTrack[];
  }, [contentResponse, item?.type]);

  const metadata = useMemo(() => extractItemMetadata(item, parentAlbum), [item, parentAlbum]);

  const bitrateGridOptions: Option<number>[] = BITRATE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.description,
  }));

  const formatGridOptions: Option<RequestFormat>[] = FORMAT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.desc,
  }));

  const matchingGridOptions: Option<RequestMatchingMode>[] = MATCHING_OPTIONS.map((opt) => ({
    value: RequestMatchingMode.enum[opt.value],
    label: opt.label,
    description: opt.description,
  }));

  const handleMutationSuccess = () => {
    if (!item) return;
    const itemName = getItemDisplayName(item);
    const selectedExternalId = item.type === ContentType.enum.track ? (parentAlbum?.id ?? item.album.id) : item.id;
    const query = selectedExternalId
      ? `?view=groups&selected=${encodeURIComponent(selectedExternalId)}`
      : "?view=groups";
    router.push(`/requests${query}`);
    onSuccess?.(itemName);
    handleClose();
  };

  const downloadMutation = useRequest();
  const downloadAlbumMutation = useBatchRequest();
  const downloadPlaylistMutation = usePlaylistRequest();

  const isMutating =
    downloadMutation.isPending || downloadAlbumMutation.isPending || downloadPlaylistMutation.isPending;
  const isLoading = isMutating || (needsTrackList && isLoadingTracks);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleDownload = () => {
    if (!item) {
      toast.error("Invalid item");
      return;
    }

    const config = {
      bitrate: { value: bitrate, matching: bitrateMatching },
      format: { value: format, matching: formatMatching },
    };

    if (item.type === ContentType.enum.track) {
      downloadMutation.mutate(
        {
          track: mapTrackFields(item),
          config,
          album_external_id: parentAlbum?.id ?? item.album.id ?? `single_${item.id}`,
        },
        { onSuccess: handleMutationSuccess }
      );
      return;
    }

    if (trackList.length === 0) {
      toast.error(`Failed to fetch ${titleCase(item.type)} tracks`);
      return;
    }

    if (item.type === ContentType.enum.album) {
      downloadAlbumMutation.mutate(
        {
          external_id: item.id,
          name: item.name,
          artist: item.artists[0]?.name || item.artist,
          album_art: item.images[0]?.url ?? null,
          release_date: item.release_date || "1900-01-01",
          total_tracks: item.total_tracks || trackList.length,
          genres: item.genres,
          tracks: trackList.map(mapTrackFields),
          config,
        },
        { onSuccess: handleMutationSuccess }
      );
      return;
    }

    if (item.type === ContentType.enum.playlist) {
      downloadPlaylistMutation.mutate(
        {
          external_id: item.id,
          name: item.name,
          description: item.description ?? null,
          owner: item.owner?.name ?? "Unknown",
          image: item.images?.[0]?.url ?? null,
          total_tracks: item.total_tracks || trackList.length,
          tracks: trackList.map((t) => ({
            ...mapTrackFields(t),
            album_external_id: t.album.id,
            album_name: t.album.name,
            album_artist: t.artists?.[0]?.name || t.artist || "Unknown Artist",
            album_image: t.album.images?.[0]?.url ?? null,
          })),
          config,
        },
        { onSuccess: handleMutationSuccess }
      );
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        data-cy="download-config-modal"
        className="glass-intense max-w-[95vw] gap-0 p-0 shadow-2xl sm:max-w-lg"
        aria-describedby="config-modal-description"
      >
        <DialogTitle className="sr-only">
          Download {titleCase(itemType)} - {metadata.name}
        </DialogTitle>

        <div id="config-modal-description" className="sr-only">
          Configure download quality settings for {metadata.name}
        </div>

        <ConfigHeader
          name={metadata.name}
          artist={metadata.artist}
          image={metadata.image}
          year={metadata.year}
          itemType={itemType}
          totalTracks={metadata.totalTracks}
          albumName={metadata.albumName}
        />

        <div className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">Quality Settings</h3>
            <OptionGrid
              label="Bitrate"
              options={bitrateGridOptions}
              value={bitrate}
              onChange={setBitrate}
              columns={4}
            />
            <OptionGrid label="Format" options={formatGridOptions} value={format} onChange={setFormat} columns={4} />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">Matching Mode</h3>
            <OptionGrid
              label="Bitrate Matching"
              options={matchingGridOptions}
              value={bitrateMatching}
              onChange={setBitrateMatching}
              columns={2}
              showCheckmark
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-fg/20 bg-fg/5 text-fg hover:bg-fg/10 flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isLoading}
              className={`${primaryGradientButton({ size: "md", glow: "primary", hover: "lighten" })} flex-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
              data-cy="confirm-download-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Requesting please wait...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
