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
import {
  useBatchRequest,
  useDelegateArtist,
  useDownloadSourcesAvailability,
  useGetContents,
  useLidarrAvailable,
  usePlaylistRequest,
  useRequest,
} from "@hooks/api";
import { primaryGradientButton } from "@theme/utilities/styles";
import { titleCase } from "@utils/formatters";
import { Download, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AcquisitionDropdown } from "./AcquisitionDropdown";
import { ConfigHeader } from "./ConfigHeader";
import { LidarrInputs } from "./LidarrInputs";
import { OptionGrid } from "./OptionGrid";
import {
  ARTIST_MONITOR_SCOPE_OPTIONS,
  AVAILABILITY_OPTIONS,
  BITRATE_OPTIONS,
  DEFAULT_ARTIST_MONITOR_SCOPE,
  DEFAULT_MONITOR_SCOPE,
  MATCHING_OPTIONS,
  MONITOR_SCOPE_OPTIONS,
  QUALITY_MODE_OPTIONS,
  UPLOAD_SPEED_OPTIONS,
} from "./consts";
import {
  buildAlbumDelegate,
  buildArtistDelegate,
  buildSourceChain,
  extractItemMetadata,
  getAvailableAcquisitionOptions,
  getItemDisplayName,
  isLidarrMethod,
  mapTrackFields,
  showsSlskdControls,
} from "./helpers";
import { configDialogContent } from "./styles";
import type {
  AcquisitionMethod,
  AvailabilityMode,
  ConfigRequestModalProps,
  LidarrArtistSelection,
  LidarrSelection,
  Option,
  QualityMode,
} from "./types";

export function ConfigRequestModal({
  isOpen,
  onClose,
  item,
  itemType,
  mode = "download",
  onSuccess,
  parentAlbum,
  preloadedTracks,
}: ConfigRequestModalProps) {
  const [bitrate, setBitrate] = useState(320);
  const [format, setFormat] = useState<RequestFormat>(RequestFormat.enum.mp3);
  const [bitrateMatching, setBitrateMatching] = useState<RequestMatchingMode>(RequestMatchingMode.enum.flexible);
  const [formatMatching, setFormatMatching] = useState<RequestMatchingMode>(RequestMatchingMode.enum.flexible);
  const [qualityMode, setQualityMode] = useState<QualityMode>("standard");
  const [minUploadSpeed, setMinUploadSpeed] = useState(0);
  const [availability, setAvailability] = useState<AvailabilityMode>("any");
  const [acquisitionMethod, setAcquisitionMethod] = useState<AcquisitionMethod>("auto");
  const [lidarrSelection, setLidarrSelection] = useState<LidarrSelection>({
    rootFolderPath: undefined,
    qualityProfileId: undefined,
    metadataProfileId: undefined,
    monitor: DEFAULT_MONITOR_SCOPE,
  });
  const [lidarrArtistSelection, setLidarrArtistSelection] = useState<LidarrArtistSelection>({
    rootFolderPath: undefined,
    qualityProfileId: undefined,
    metadataProfileId: undefined,
    monitor: DEFAULT_ARTIST_MONITOR_SCOPE,
  });
  const losslessActive = qualityMode === "lossless";

  const isLidarrArtistMode = mode === "lidarr-artist";

  const { t } = useTranslation("search");
  const router = useRouter();

  const isAlbumItem = item?.type === ContentType.enum.album;

  const { data: sourcesAvailability } = useDownloadSourcesAvailability();
  const { data: lidarrAvailability } = useLidarrAvailable({ enabled: isAlbumItem });
  const enabledSources = useMemo(
    () => ({
      slskd: sourcesAvailability?.slskd ?? false,
      ytdlp: sourcesAvailability?.ytdlp ?? false,
    }),
    [sourcesAvailability]
  );
  const acquisitionOptions = useMemo(
    () =>
      getAvailableAcquisitionOptions(enabledSources, {
        isAlbum: isAlbumItem,
        lidarrAvailable: lidarrAvailability?.available ?? false,
      }),
    [enabledSources, isAlbumItem, lidarrAvailability?.available]
  );

  useEffect(() => {
    if (!acquisitionOptions.some((option) => option.value === acquisitionMethod)) setAcquisitionMethod("auto");
  }, [acquisitionOptions, acquisitionMethod]);

  const lidarrSelected = isLidarrMethod(acquisitionMethod);
  const showSlskdControls = !lidarrSelected && showsSlskdControls(acquisitionMethod);

  const needsTrackList =
    !isLidarrArtistMode &&
    !!item &&
    item.type !== ContentType.enum.track &&
    item.type !== ContentType.enum.artist &&
    !preloadedTracks;
  const { data: contentResponse, isLoading: isLoadingTracks } = useGetContents(
    item?.id ?? "",
    needsTrackList,
    item?.type ?? ContentType.enum.album
  );

  const trackList = useMemo<MusicTrack[]>(() => {
    if (preloadedTracks) return preloadedTracks;
    if (!contentResponse?.success || !contentResponse.content) return [];
    const content = Array.isArray(contentResponse.content) ? contentResponse.content : [];
    if (item?.type === ContentType.enum.playlist) {
      const playlistTracks = content as MusicPlaylistTrack[];
      return playlistTracks.filter((pt) => pt?.track).map((pt) => pt.track);
    }
    return content as MusicTrack[];
  }, [preloadedTracks, contentResponse, item?.type]);

  const metadata = useMemo(() => extractItemMetadata(item, parentAlbum), [item, parentAlbum]);

  const bitrateGridOptions: Option<number>[] = BITRATE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: t(opt.descriptionKey),
  }));

  const formatGridOptions: Option<RequestFormat>[] = FORMAT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.label,
    description: opt.desc,
  }));

  const matchingGridOptions: Option<RequestMatchingMode>[] = MATCHING_OPTIONS.map((opt) => ({
    value: RequestMatchingMode.enum[opt.value],
    label: t(opt.labelKey),
    description: t(opt.descriptionKey),
  }));

  const qualityGridOptions: Option<QualityMode>[] = QUALITY_MODE_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
    description: t(opt.descriptionKey),
  }));

  const uploadSpeedGridOptions: Option<number>[] = UPLOAD_SPEED_OPTIONS.map((opt) => ({
    value: opt.value,
    label: opt.labelKey ? t(opt.labelKey) : (opt.label ?? ""),
    description: t(opt.descriptionKey),
  }));

  const availabilityGridOptions: Option<AvailabilityMode>[] = AVAILABILITY_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey),
    description: t(opt.descriptionKey),
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
  const delegateArtistMutation = useDelegateArtist();

  const isMutating =
    downloadMutation.isPending ||
    downloadAlbumMutation.isPending ||
    downloadPlaylistMutation.isPending ||
    delegateArtistMutation.isPending;
  const isLoading = isMutating || (!isLidarrArtistMode && needsTrackList && isLoadingTracks);

  const handleClose = () => {
    if (!isLoading) onClose();
  };

  const handleDelegateArtist = () => {
    if (!item || item.type !== ContentType.enum.artist) return;
    const delegate = buildArtistDelegate(item.name, lidarrArtistSelection);
    if (!delegate) {
      toast.error(t("config.errors.lidarrIncomplete"));
      return;
    }
    delegateArtistMutation.mutate(delegate, {
      onSuccess: () => {
        onSuccess?.(item.name);
        onClose();
      },
    });
  };

  const handleDownload = () => {
    if (!item) {
      toast.error(t("config.errors.invalidItem"));
      return;
    }

    const sourceChain = buildSourceChain(acquisitionMethod, enabledSources);
    const config = {
      bitrate: { value: bitrate, matching: bitrateMatching },
      format: losslessActive
        ? { value: RequestFormat.enum.flac, matching: RequestMatchingMode.enum.strict }
        : { value: format, matching: formatMatching },
      minUploadSpeed,
      requireFreeSlot: availability === "free",
      ...(sourceChain ? { sourceChain } : {}),
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
      toast.error(t("config.errors.fetchFailed", { type: titleCase(item.type) }));
      return;
    }

    if (item.type === ContentType.enum.album) {
      const delegate = lidarrSelected ? buildAlbumDelegate(lidarrSelection) : undefined;
      if (lidarrSelected && !delegate) {
        toast.error(t("config.errors.lidarrIncomplete"));
        return;
      }
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
          ...(delegate ? { delegate } : {}),
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
        className={configDialogContent()}
        aria-describedby="config-modal-description"
      >
        <DialogTitle className="sr-only">
          {t("config.dialogTitle", { type: titleCase(itemType), name: metadata.name })}
        </DialogTitle>

        <div id="config-modal-description" className="sr-only">
          {t("config.dialogDescription", { name: metadata.name })}
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
          {isLidarrArtistMode ? (
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                {t("config.sections.lidarr")}
              </h3>
              <p className="text-fg/60 text-sm">{t("config.artistLidarr.description")}</p>
              <LidarrInputs
                value={lidarrArtistSelection}
                onChange={setLidarrArtistSelection}
                monitorOptions={ARTIST_MONITOR_SCOPE_OPTIONS}
              />
            </div>
          ) : (
            <>
              {!lidarrSelected && (
                <>
                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                      {t("config.sections.quality")}
                    </h3>
                    <OptionGrid
                      label={t("config.fields.quality")}
                      options={qualityGridOptions}
                      value={qualityMode}
                      onChange={setQualityMode}
                      columns={2}
                      showCheckmark
                    />
                    <OptionGrid
                      label={t("config.fields.bitrate")}
                      options={bitrateGridOptions}
                      value={bitrate}
                      onChange={setBitrate}
                      columns={4}
                    />
                    <OptionGrid
                      label={t("config.fields.format")}
                      options={formatGridOptions}
                      value={format}
                      onChange={setFormat}
                      columns={4}
                      disabled={losslessActive}
                    />
                  </div>

                  <div className="space-y-3 sm:space-y-4">
                    <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                      {t("config.sections.matching")}
                    </h3>
                    <OptionGrid
                      label={t("config.fields.bitrateMatching")}
                      options={matchingGridOptions}
                      value={bitrateMatching}
                      onChange={setBitrateMatching}
                      columns={2}
                      showCheckmark
                    />
                    <OptionGrid
                      label={t("config.fields.formatMatching")}
                      options={matchingGridOptions}
                      value={formatMatching}
                      onChange={setFormatMatching}
                      columns={2}
                      showCheckmark
                      disabled={losslessActive}
                    />
                  </div>
                </>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                  {t("config.sections.acquisition")}
                </h3>
                <AcquisitionDropdown
                  label={t("config.fields.acquisition")}
                  value={acquisitionMethod}
                  options={acquisitionOptions}
                  onChange={setAcquisitionMethod}
                />
              </div>

              {lidarrSelected && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                    {t("config.sections.lidarr")}
                  </h3>
                  <LidarrInputs
                    value={lidarrSelection}
                    onChange={setLidarrSelection}
                    monitorOptions={MONITOR_SCOPE_OPTIONS}
                  />
                </div>
              )}

              {showSlskdControls && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                    {t("config.sections.peer")}
                  </h3>
                  <OptionGrid
                    label={t("config.fields.minUploadSpeed")}
                    options={uploadSpeedGridOptions}
                    value={minUploadSpeed}
                    onChange={setMinUploadSpeed}
                    columns={4}
                  />
                  <OptionGrid
                    label={t("config.fields.availability")}
                    options={availabilityGridOptions}
                    value={availability}
                    onChange={setAvailability}
                    columns={2}
                    showCheckmark
                  />
                </div>
              )}
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-fg/20 bg-fg/5 text-fg hover:bg-fg/10 flex-1"
              disabled={isLoading}
            >
              {t("config.actions.cancel")}
            </Button>
            <Button
              onClick={isLidarrArtistMode ? handleDelegateArtist : handleDownload}
              disabled={isLoading}
              className={`${primaryGradientButton({ size: "md", glow: "primary", hover: "lighten" })} flex-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
              data-cy="confirm-download-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("config.actions.requesting")}
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  {isLidarrArtistMode ? t("config.actions.addToLidarr") : t("config.actions.request")}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
