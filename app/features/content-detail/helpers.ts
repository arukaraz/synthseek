import {
  type AppRouter,
  type MusicAlbum,
  type MusicArtist,
  type MusicImage,
  type MusicItem,
  type MusicPlaylist,
  type MusicPlaylistTrack,
  type MusicTrack,
  RequestStatus,
} from "@api/__generated__/types";
import type { inferRouterOutputs } from "@trpc/server";
import i18n from "@locale";
import { formatDate } from "@utils/formatters";
import { isRequestedStatus } from "@utils/status-helpers";
import type { CSSProperties } from "react";

import type { TracklistTrack } from "./components/Tracklist/types";
import type { HeroRequestState } from "./components/DetailHero/types";
import type {
  AlbumRequestInput,
  ArtistRequestInput,
  DetailTarget,
  FactItem,
  PlaylistPreloadedTargetInput,
  TrackRequestInput,
} from "./types";

export function formatBorn(bornDate: string | null, bornPlace: string | null): string | null {
  if (!bornDate) return null;
  const date = formatDate(new Date(bornDate));
  return bornPlace ? `${date} · ${bornPlace}` : date;
}

export interface TrackStatusCounts {
  completeCount: number;
  failedCount: number;
  requestedCount: number;
}

export function deriveTrackStatusCounts(tracks: TracklistTrack[]): TrackStatusCounts {
  let completeCount = 0;
  let failedCount = 0;
  let requestedCount = 0;
  for (const track of tracks) {
    if (track.status === RequestStatus.enum.complete) completeCount += 1;
    if (track.status === RequestStatus.enum.failed) failedCount += 1;
    if (isRequestedStatus(track.status)) requestedCount += 1;
  }
  return { completeCount, failedCount, requestedCount };
}

export function computeRequestState({
  requestedTrackCount,
  failedTrackCount,
  libraryTrackCount,
  totalTracks,
}: {
  requestedTrackCount: number;
  failedTrackCount: number;
  libraryTrackCount: number;
  totalTracks: number;
}): HeroRequestState {
  const inProgressCount = requestedTrackCount - libraryTrackCount;
  const exists = requestedTrackCount > 0 || failedTrackCount > 0;
  if (!exists) return "request";
  if (inProgressCount > 0) return "inLibrary";
  const missingCount = totalTracks - libraryTrackCount;
  if (missingCount > 0) return "requestMissing";
  return "inLibrary";
}

export function cardRingFillStyle(libraryTrackCount: number, totalTracks: number): CSSProperties {
  const ratio = totalTracks > 0 ? Math.min(1, libraryTrackCount / totalTracks) : 0;
  return { "--dock-ring-fill": `${Math.round(ratio * 360)}deg` } as CSSProperties;
}

export function isRemovableTrack(track: TracklistTrack): track is TracklistTrack & { requestId: string } {
  return (
    !!track.requestId && (track.status === RequestStatus.enum.complete || track.status === RequestStatus.enum.failed)
  );
}

export function detailInitials(name: string): string {
  const words = name
    .trim()
    .split(" ")
    .filter((word) => word.length > 0);
  if (words.length === 0) return "?";
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return words[0].slice(0, 2).toUpperCase();
}

export function formatStat(value: number | null): string {
  if (value === null) return "-";
  if (value < 10000) return value.toLocaleString(i18n.language);
  return new Intl.NumberFormat(i18n.language, { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

type ArtistDiscography = inferRouterOutputs<AppRouter>["contentDetail"]["artistDiscography"];

export function countAlbumsInLibrary(discography: ArtistDiscography | undefined): number | null {
  if (!discography) return null;
  return discography.groups.reduce(
    (total, group) => total + group.albums.filter((album) => album.libraryTrackCount > 0).length,
    0
  );
}

export function visibleFacts(facts: FactItem[]): FactItem[] {
  return facts.filter((fact) => {
    if (fact.items) return fact.items.length > 0;
    return fact.value !== null && fact.value.trim().length > 0;
  });
}

export function albumTarget(args: {
  id: string;
  name: string;
  artistName: string;
  cover: string | null;
}): DetailTarget {
  return {
    mode: "album",
    id: args.id,
    name: args.name,
    artistName: args.artistName,
    cover: args.cover,
  };
}

export function artistTarget(args: { id: string; name: string; cover: string | null }): DetailTarget {
  return {
    mode: "artist",
    id: args.id,
    name: args.name,
    artistName: args.name,
    cover: args.cover,
  };
}

export function playlistTarget(args: { id: string; name: string; cover: string | null }): DetailTarget {
  return {
    mode: "playlist",
    id: args.id,
    name: args.name,
    artistName: args.name,
    cover: args.cover,
    playlistSource: "catalog",
  };
}

export function playlistLibraryTarget(args: { id: string; name: string; cover: string | null }): DetailTarget {
  return {
    mode: "playlist",
    id: args.id,
    name: args.name,
    artistName: args.name,
    cover: args.cover,
    playlistSource: "library",
  };
}

export function preloadedTrack(track: MusicTrack): TracklistTrack {
  return {
    externalId: track.id,
    title: track.title,
    artist: track.artists[0]?.name || track.artist,
    durationMs: track.duration_ms,
    trackNumber: track.track_number,
    plays: null,
    inLibrary: false,
    requestId: null,
    slskd_request_id: null,
    status: null,
    failureReason: null,
  };
}

type CatalogContent = MusicTrack[] | MusicPlaylistTrack[] | MusicAlbum[];

function isPlaylistTrackEntry(entry: CatalogContent[number]): entry is MusicPlaylistTrack {
  return "track" in entry && typeof entry.track === "object" && entry.track !== null;
}

export function catalogPlaylistTracks(content: CatalogContent | undefined): TracklistTrack[] {
  if (!content) return [];
  return content.filter(isPlaylistTrackEntry).map((entry) => preloadedTrack(entry.track));
}

export function playlistPreloadedTarget({
  id,
  name,
  cover,
  tracks,
  requestDisabled,
  requestDisabledTooltip,
}: PlaylistPreloadedTargetInput): DetailTarget {
  return {
    mode: "playlist",
    id,
    name,
    artistName: name,
    cover,
    playlistSource: "preloaded",
    preloadedTracks: tracks.map(preloadedTrack),
    requestDisabled,
    requestDisabledTooltip,
  };
}

export function detailTargetFromMusicItem(item: MusicItem): DetailTarget | null {
  if (item.type === "album") {
    return albumTarget({
      id: item.id,
      name: item.name,
      artistName: item.artists[0]?.name || item.artist,
      cover: item.images[0]?.url ?? null,
    });
  }
  if (item.type === "artist") {
    return artistTarget({ id: item.id, name: item.name, cover: item.images[0]?.url ?? null });
  }
  if (item.type === "playlist") {
    return playlistTarget({ id: item.id, name: item.name, cover: item.images[0]?.url ?? null });
  }
  return null;
}

function coverImages(cover: string | null): MusicImage[] {
  return cover ? [{ url: cover, width: null, height: null }] : [];
}

export function albumRequestItem({ id, name, artistName, cover, genres }: AlbumRequestInput): MusicAlbum {
  return {
    type: "album",
    id,
    name,
    artist: artistName,
    artists: artistName ? [{ id: "", name: artistName }] : [],
    images: coverImages(cover),
    release_date: "",
    total_tracks: 0,
    genres: genres ?? [],
    label: null,
    upc: null,
    tracks: [],
  };
}

export function playlistOpenItem(args: {
  id: string;
  name: string;
  cover: string | null;
  totalTracks: number;
}): MusicPlaylist {
  return {
    type: "playlist",
    id: args.id,
    name: args.name,
    description: null,
    images: coverImages(args.cover),
    owner: { id: "", name: "" },
    total_tracks: args.totalTracks,
    tracks: [],
  };
}

export function playlistRequestTracks(tracks: TracklistTrack[]): MusicTrack[] {
  return tracks.map((track) => ({
    type: "track",
    id: track.externalId,
    title: track.title,
    artist: track.artist,
    artists: track.artist ? [{ id: "", name: track.artist }] : [],
    album: { id: "", name: "", images: [] },
    duration_ms: track.durationMs,
    track_number: track.trackNumber,
    disc_number: 1,
    isrc: null,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [],
  }));
}

export function artistRequestItem({ id, name }: ArtistRequestInput): MusicArtist {
  return {
    type: "artist",
    id,
    name,
    images: [],
    genres: [],
    followers: null,
  };
}

export function trackRequestItem({
  id,
  title,
  artistName,
  durationMs,
  trackNumber,
  isrc,
  album,
}: TrackRequestInput): MusicTrack {
  return {
    type: "track",
    id,
    title,
    artist: artistName,
    artists: artistName ? [{ id: "", name: artistName }] : [],
    album: {
      id: album?.id ?? "",
      name: album?.name ?? "",
      images: coverImages(album?.cover ?? null),
    },
    duration_ms: durationMs,
    track_number: trackNumber,
    disc_number: 1,
    isrc,
    explicit: false,
    popularity: null,
    preview_url: null,
    images: [],
  };
}
