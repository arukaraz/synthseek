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
import { Input } from "@components/ui/Input";
import { Spinner } from "@components/ui/Spinner";
import { primaryGradientButton } from "@theme/utilities/styles";
import { titleCase } from "@utils/formatters";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { AcquisitionOrderList } from "./AcquisitionOrderList";
import { ConfigHeader } from "./ConfigHeader";
import { LidarrInputs } from "./LidarrInputs";
import { OptionGrid } from "./OptionGrid";
import {
  AVAILABILITY_OPTIONS,
  BITRATE_OPTIONS,
  DEFAULT_ARTIST_MONITOR_SCOPE,
  DEFAULT_MONITOR_SCOPE,
  MATCHING_OPTIONS,
  QUALITY_MODE_OPTIONS,
  UPLOAD_SPEED_OPTIONS,
} from "./consts";
import {
  allowsLossless,
  buildAlbumDelegate,
  buildArtistDelegate,
  buildSourceChain,
  extractItemMetadata,
  defaultSelection,
  offeredSources,
  reconcileSelection,
  getItemDisplayName,
  isLidarrSelected,
  mapTrackFields,
  usesSlskd,
} from "./helpers";
import { configDialogContent, fieldGroup, fieldLabel } from "./styles";
import type {
  AcquisitionSelection,
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
  const [acquisition, setAcquisition] = useState<AcquisitionSelection>({ mode: "auto", order: [], active: [] });
  const [lidarrSelection, setLidarrSelection] = useState<LidarrSelection>({
    rootFolderPath: undefined,
    qualityProfileId: undefined,
    metadataProfileId: undefined,
    monitor: DEFAULT_MONITOR_SCOPE,
    tags: [],
  });
  const [lidarrArtistSelection, setLidarrArtistSelection] = useState<LidarrArtistSelection>({
    rootFolderPath: undefined,
    qualityProfileId: undefined,
    metadataProfileId: undefined,
    monitor: DEFAULT_ARTIST_MONITOR_SCOPE,
    tags: [],
  });
  const [renameValue, setRenameValue] = useState("");
  const losslessActive = qualityMode === "lossless";

  const isLidarrArtistMode = mode === "lidarr-artist";

  useEffect(() => {
    setRenameValue("");
  }, [item?.id, isOpen]);

  const { t } = useTranslation("search");

  const isAlbumItem = item?.type === ContentType.enum.album;

  const { data: sourcesAvailability } = useDownloadSourcesAvailability();
  const { data: lidarrAvailability } = useLidarrAvailable({ enabled: isAlbumItem });
  const enabledSources = useMemo(
    () => ({
      slskd: sourcesAvailability?.slskd ?? false,
      ytdlp: sourcesAvailability?.ytdlp ?? false,
      usenet: sourcesAvailability?.usenet ?? false,
    }),
    [sourcesAvailability]
  );
  const offered = useMemo(
    () =>
      offeredSources(enabledSources, {
        isAlbum: isAlbumItem,
        lidarrAvailable: lidarrAvailability?.available ?? false,
        usenetAllowsSingleTracks: sourcesAvailability?.usenetAllowsSingleTracks ?? false,
      }),
    [enabledSources, isAlbumItem, sourcesAvailability?.usenetAllowsSingleTracks]
  );
  const lidarrOffered = isAlbumItem && (lidarrAvailability?.available ?? false);

  useEffect(() => {
    setAcquisition((current) =>
      current.order.length === 0 ? defaultSelection(offered) : reconcileSelection(current, offered, lidarrOffered)
    );
  }, [offered, lidarrOffered]);

  useEffect(() => {
    if (!allowsLossless(acquisition) && qualityMode === "lossless") setQualityMode("standard");
  }, [acquisition, qualityMode]);

  const lidarrSelected = isLidarrSelected(acquisition);
  const showSlskdControls = usesSlskd(acquisition);
  const losslessAvailable = allowsLossless(acquisition);
  const showMatchingControls = !lidarrSelected && losslessAvailable;

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

  const qualityGridOptions: Option<QualityMode>[] = QUALITY_MODE_OPTIONS.filter(
    (opt) => losslessAvailable || opt.value !== "lossless"
  ).map((opt) => ({
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

  const downloadMutation = useRequest();
  const downloadAlbumMutation = useBatchRequest();
  const downloadPlaylistMutation = usePlaylistRequest();
  const delegateArtistMutation = useDelegateArtist();

  const isSubmitting =
    downloadMutation.isPending ||
    downloadAlbumMutation.isPending ||
    downloadPlaylistMutation.isPending ||
    delegateArtistMutation.isPending;
  const isLoadingData = !isLidarrArtistMode && needsTrackList && isLoadingTracks;
  const isBusy = isSubmitting || isLoadingData;

  const handleClose = () => {
    if (!isSubmitting) onClose();
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

    const sourceChain = buildSourceChain(acquisition);
    const config = {
      bitrate: { value: bitrate, matching: bitrateMatching },
      format: losslessActive
        ? { value: RequestFormat.enum.flac, matching: RequestMatchingMode.enum.strict }
        : { value: format, matching: formatMatching },
      minUploadSpeed,
      requireFreeSlot: availability === "free",
      ...(sourceChain ? { sourceChain } : {}),
    };

    const itemName = getItemDisplayName(item);

    if (item.type === ContentType.enum.track) {
      downloadMutation.mutate({
        track: mapTrackFields(item),
        config,
        album_external_id: parentAlbum?.id ?? item.album.id ?? `single_${item.id}`,
      });
      onSuccess?.(itemName);
      onClose();
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
      downloadAlbumMutation.mutate({
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
      });
      onSuccess?.(itemName);
      onClose();
      return;
    }

    if (item.type === ContentType.enum.playlist) {
      const effectiveName = renameValue.trim() || item.name;
      downloadPlaylistMutation.mutate({
        external_id: item.id,
        name: effectiveName,
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
      });
      onSuccess?.(effectiveName);
      onClose();
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
              <LidarrInputs monitorMode="artist" value={lidarrArtistSelection} onChange={setLidarrArtistSelection} />
            </div>
          ) : (
            <>
              {item.type === ContentType.enum.playlist && (
                <div className={fieldGroup()}>
                  <label className={fieldLabel()} htmlFor="playlist-rename-input">
                    {t("config.fields.renamePlaylist")}
                  </label>
                  <Input
                    id="playlist-rename-input"
                    value={renameValue}
                    onChange={(event) => setRenameValue(event.target.value)}
                    placeholder={item.name}
                    data-cy="playlist-rename-input"
                  />
                </div>
              )}

              <div className="space-y-3 sm:space-y-4">
                <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                  {t("config.sections.acquisition")}
                </h3>
                <AcquisitionOrderList
                  label={t("config.fields.acquisition")}
                  selection={acquisition}
                  lidarrAvailable={lidarrOffered}
                  onChange={setAcquisition}
                />
              </div>

              {!lidarrSelected && (
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
              )}

              {showMatchingControls && (
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
              )}

              {lidarrSelected && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-fg/90 text-xs font-semibold tracking-wide uppercase sm:text-sm">
                    {t("config.sections.lidarr")}
                  </h3>
                  <LidarrInputs monitorMode="album" value={lidarrSelection} onChange={setLidarrSelection} />
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
              disabled={isSubmitting}
            >
              {t("config.actions.cancel")}
            </Button>
            <Button
              onClick={isLidarrArtistMode ? handleDelegateArtist : handleDownload}
              disabled={isBusy}
              className={`${primaryGradientButton({ size: "md", glow: "primary", hover: "lighten" })} flex-1 font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
              data-cy="confirm-download-btn"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" decorative className="mr-2" />
                  {t("config.actions.requesting")}
                </>
              ) : isLoadingData ? (
                <>
                  <Spinner size="sm" decorative className="mr-2" />
                  {t("config.actions.loadingTracks")}
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
