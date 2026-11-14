"use client";

import { BottomSheet, bottomSheetBody } from "@components/ui/BottomSheet";
import { cn } from "@utils/cn";
import { Button } from "@components/ui/Button";
import { DialogTitle } from "@components/ui/Dialog";
import { ContentType } from "@api/__generated__/types";
import {
  useDelegateArtist,
  useDownloadSourcesAvailability,
  useGetContents,
  useLibraryDestination,
  useLidarrAvailable,
  useLidarrProfiles,
  useMyRequestPreset,
} from "@hooks/api";
import { Input } from "@components/ui/Input";
import { Spinner } from "@components/ui/Spinner";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { primaryGradientButton } from "@theme/utilities/styles";
import { canCustomizeRequestsFE } from "@utils/authorization";
import { titleCase } from "@utils/formatters";
import { Download } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import { useContentRequestSubmit } from "../../hooks/useContentRequestSubmit";
import { ConfigHeader } from "./ConfigHeader";
import { LidarrInputs } from "./LidarrInputs";
import { RequestFooter } from "./RequestFooter";
import { RequestRecipe } from "./RequestRecipe";
import { DEFAULT_ARTIST_MONITOR_SCOPE, DEFAULT_MONITOR_SCOPE } from "./constants";
import {
  buildAlbumDelegate,
  buildArtistDelegate,
  changedRecipeRows,
  describeLidarr,
  destinationRequestFor,
  extractItemMetadata,
  getItemDisplayName,
  isLidarrSelected,
  offeredSources,
  presetFromSelection,
  reconcileSelection,
  selectionFromPreset,
  summarizeSelection,
  tracksFromContents,
} from "./helpers";
import { configBody, configSheet, fieldGroup, fieldLabel, presetNote, sectionHeading, sectionStack } from "./styles";
import type {
  ConfigRequestModalProps,
  LidarrArtistSelection,
  LidarrSelection,
  RecipeDestination,
  RequestSelection,
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
  keepRequesting,
}: ConfigRequestModalProps) {
  const [selection, setSelection] = useState<RequestSelection | null>(null);
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
  const [destinationPathId, setDestinationPathId] = useState<string | null>(null);
  const { isAdmin, currentUser } = useAuthContext();
  const canCustomize = canCustomizeRequestsFE(currentUser);
  const { t } = useTranslation("search");

  const isLidarrArtistMode = mode === "lidarr-artist";
  const isArtistTracksMode = mode === "artist-tracks";
  const isAlbumItem = item?.type === ContentType.enum.album;

  const { data: sourcesAvailability, isPending: isLoadingSources } = useDownloadSourcesAvailability();
  const { data: lidarrAvailability } = useLidarrAvailable({ enabled: isAlbumItem });
  const presetQuery = useMyRequestPreset();
  const offered = useMemo(() => offeredSources(sourcesAvailability, isAlbumItem), [sourcesAvailability, isAlbumItem]);
  const lidarrOffered = isAlbumItem && (lidarrAvailability?.available ?? false);
  const effectivePreset = presetQuery.data?.effective.preset;

  const base = useMemo(
    () => (effectivePreset === undefined || isLoadingSources ? null : selectionFromPreset(effectivePreset, offered)),
    [effectivePreset, isLoadingSources, offered]
  );

  useEffect(() => {
    setRenameValue("");
    setDestinationPathId(null);
    setSelection(null);
  }, [item?.id, isOpen]);

  useEffect(() => {
    if (!isOpen || isLoadingSources || effectivePreset === undefined) return;
    setSelection((current) =>
      current === null
        ? selectionFromPreset(effectivePreset, offered)
        : { ...current, acquisition: reconcileSelection(current.acquisition, offered, lidarrOffered) }
    );
  }, [isOpen, isLoadingSources, effectivePreset, offered, lidarrOffered]);

  const lidarrSelected = selection !== null && isLidarrSelected(selection.acquisition);
  const config = selection === null || !canCustomize ? undefined : presetFromSelection(selection);
  const destinationRequest =
    isAdmin && config && !lidarrSelected ? destinationRequestFor(item, parentAlbum, config.format.value, mode) : null;
  const { data: destinationPreview, isPlaceholderData: destinationRefreshing } =
    useLibraryDestination(destinationRequest);
  const destination: RecipeDestination | null =
    destinationRequest !== null && destinationPreview !== undefined && destinationPreview.paths.length > 1
      ? {
          preview: destinationPreview,
          value: destinationPathId,
          onChange: setDestinationPathId,
          refreshing: destinationRefreshing,
        }
      : null;
  const { data: lidarrProfiles } = useLidarrProfiles({ enabled: lidarrSelected || isLidarrArtistMode });

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
  const trackList = useMemo(
    () => preloadedTracks ?? tracksFromContents(contentResponse),
    [preloadedTracks, contentResponse]
  );

  const metadata = useMemo(() => {
    const itemMetadata = extractItemMetadata(item, parentAlbum);
    return isArtistTracksMode
      ? { ...itemMetadata, artist: t("config.header.topTracks"), totalTracks: trackList.length }
      : itemMetadata;
  }, [item, parentAlbum, isArtistTracksMode, trackList.length, t]);

  const { submit, isSubmitting: isRequesting } = useContentRequestSubmit();
  const delegateArtistMutation = useDelegateArtist();

  const isSubmitting = isRequesting || delegateArtistMutation.isPending;
  const presetUnavailable = presetQuery.isError;
  const isLoadingPreset = !isLidarrArtistMode && selection === null && !presetUnavailable;
  const isLoadingData = !isLidarrArtistMode && ((needsTrackList && isLoadingTracks) || isLoadingPreset);
  const isBusy = isSubmitting || isLoadingData;

  const changedCount =
    selection !== null && base !== null && canCustomize
      ? changedRecipeRows(selection, base, destination !== null, destinationPathId).length
      : 0;
  const footerSummary = isLidarrArtistMode
    ? describeLidarr(lidarrArtistSelection, lidarrProfiles, t)
    : selection === null
      ? null
      : lidarrSelected
        ? describeLidarr(lidarrSelection, lidarrProfiles, t)
        : summarizeSelection(selection, t);
  const footerNote =
    isLidarrArtistMode || selection === null
      ? null
      : t(changedCount > 0 ? "config.preset.forThisRequest" : "config.preset.sameAsDirect");

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

    const delegate = lidarrSelected && isAlbumItem ? buildAlbumDelegate(lidarrSelection) : undefined;
    if (lidarrSelected && isAlbumItem && !delegate) {
      toast.error(t("config.errors.lidarrIncomplete"));
      return;
    }

    const playlistName = item.type === ContentType.enum.playlist ? renameValue.trim() || item.name : undefined;
    const outcome = submit({
      item,
      mode,
      parentAlbum,
      tracks: trackList,
      config,
      delegate,
      destinationPathId: destination !== null && destinationPathId !== null ? destinationPathId : undefined,
      playlistName,
    });

    if (outcome === "noTracks") {
      toast.error(t("config.errors.fetchFailed", { type: titleCase(item.type) }));
      return;
    }
    onSuccess?.(playlistName ?? getItemDisplayName(item));
    onClose();
  };

  if (!item) return null;

  return (
    <BottomSheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) handleClose();
      }}
      className={configSheet()}
      data-cy="download-config-modal"
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

      <div className={cn(bottomSheetBody(), configBody())}>
        {isLidarrArtistMode ? (
          <div className={sectionStack()}>
            <h3 className={sectionHeading()}>{t("config.sections.lidarr")}</h3>
            <p className={presetNote()}>{t("config.artistLidarr.description")}</p>
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

            {presetUnavailable && selection === null ? (
              <p className={presetNote()} data-cy="request-preset-unavailable">
                {t("config.presetUnavailable")}
              </p>
            ) : null}

            {selection !== null && base !== null ? (
              <RequestRecipe
                selection={selection}
                base={base}
                onChange={setSelection}
                locked={!canCustomize}
                origin={presetQuery.data?.effective.origin}
                offered={offered}
                lidarrAvailable={lidarrOffered}
                lidarrSlot={<LidarrInputs monitorMode="album" value={lidarrSelection} onChange={setLidarrSelection} />}
                destination={destination}
              />
            ) : null}
          </>
        )}
      </div>

      <RequestFooter summary={footerSummary} note={footerNote} keepRequesting={keepRequesting}>
        <Button
          onClick={isLidarrArtistMode ? handleDelegateArtist : handleDownload}
          disabled={isBusy}
          className={`${primaryGradientButton({ size: "md", glow: "primary", hover: "lighten" })} shrink-0 font-semibold disabled:cursor-not-allowed disabled:opacity-50`}
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
      </RequestFooter>
    </BottomSheet>
  );
}
