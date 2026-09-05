"use client";

import { nextRepeat, type PlayerActions, type PlayerDevice, type PlayerView } from "@components/Player";
import {
  useFavoriteTracks,
  useListeningConnections,
  useSetFavoriteTrack,
  useSetScrobbleEnabled,
  useTrackLyrics,
} from "@hooks/api";
import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { deviceKindFrom } from "./device";
import { isMirroring, mirroredPositionSeconds, scrobbleStateFrom } from "./helpers";
import { actions, currentTrack, getSnapshot, setMessages, subscribe } from "./store";
import { usePlayerDevices } from "./useDevices";
import { usePlayReporter } from "./usePlayReporter";
import type { PlayerDockState, PlayerSessionState } from "./types";

const EMPTY_STATE = getSnapshot();

function dockSnapshot(): PlayerDockState {
  const session = getSnapshot();
  if (!session.started) return "hidden";
  return session.chainVisible ? "chain" : "bar";
}

export function usePlayerDock(): PlayerDockState {
  return useSyncExternalStore(subscribe, dockSnapshot, () => "hidden");
}

function usePlayerSession(): PlayerSessionState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STATE);
}

export function usePlayer(): { view: PlayerView | null; actions: PlayerActions } {
  const { t } = useTranslation("player");
  const session = usePlayerSession();
  const { devices: known, handOverTo, commandActive } = usePlayerDevices();
  usePlayReporter();
  const mirroring = isMirroring(session);
  const localKind = typeof navigator === "undefined" ? "computer" : deviceKindFrom(navigator.userAgent);
  const playingTrack = (mirroring ? (session.remote?.track ?? null) : (session.queue[session.index] ?? null)) ?? null;
  const measured = mirroring ? (session.remote?.track?.durationSeconds ?? 0) : session.durationSeconds;
  const track = useMemo(
    () =>
      playingTrack === null
        ? null
        : { ...playingTrack, durationSeconds: measured > 0 ? measured : playingTrack.durationSeconds },
    [playingTrack, measured]
  );
  const favorites = useFavoriteTracks(track === null ? [] : [track.id]);
  const connections = useListeningConnections();
  const { mutate: setScrobbleEnabled } = useSetScrobbleEnabled();
  const connected = (connections.data ?? []).filter((connection) => connection.connected);
  const toggleScrobbling = useCallback(() => {
    const enabled = !connected.some((connection) => connection.scrobbleEnabled);
    for (const connection of connected) setScrobbleEnabled({ service: connection.service, enabled });
  }, [connected, setScrobbleEnabled]);
  const lyrics = useTrackLyrics(session.lyricsOpen && track !== null ? track.id : null);
  const { mutate: setFavorite, isPending, variables } = useSetFavoriteTrack();
  const pendingForThisTrack = isPending && variables.trackId === track?.id;
  const favorite = pendingForThisTrack ? variables.favorite : (favorites.data ?? []).includes(track?.id ?? "");

  const toggleFavorite = useCallback(() => {
    if (track === null) return;
    setFavorite({ trackId: track.id, favorite: !favorite });
  }, [favorite, setFavorite, track]);

  useEffect(() => {
    setMessages({
      skipping: (title) => t("notice.skipping", { title }),
      resumedFrom: (client) => t("notice.resumed", { client }),
      handOverFailed: (device) => t("notice.handOverFailed", { device }),
      deviceGone: t("notice.deviceGone"),
      queueEnd: t("notice.queueEnd"),
      autoplayBlocked: t("notice.autoplayBlocked"),
      tooManyFailures: t("notice.tooManyFailures"),
    });
  }, [t]);

  useEffect(() => {
    actions.restoreVolume();
  }, []);

  const here: PlayerDevice = {
    id: "here",
    name: t("devices.thisBrowser"),
    kind: localKind,
    active: !mirroring,
    local: true,
    armed: true,
    playing: session.playing,
  };

  const playingOn = session.remote;

  const mirrored: PlayerDevice | null =
    playingOn === null
      ? null
      : {
          id: playingOn.deviceId,
          name: playingOn.deviceName,
          kind: known.find((device) => device.id === playingOn.deviceId)?.kind ?? "computer",
          active: mirroring,
          local: false,
          armed: true,
          playing: playingOn.playing,
        };

  const devices: PlayerDevice[] = [
    here,
    ...(mirrored !== null && !known.some((device) => device.id === mirrored.id) ? [mirrored] : []),
    ...known.map((device) => {
      const announced = playingOn !== null && playingOn.deviceId === device.id ? playingOn : null;
      const playing = announced?.playing ?? device.playing;
      return {
        id: device.id,
        name: device.name,
        kind: device.kind,
        active: mirroring && device.id === playingOn?.deviceId,
        local: false,
        armed: device.armed || announced !== null,
        playing,
      };
    }),
  ];

  const playerActions: PlayerActions = {
    togglePlay: mirroring
      ? () => {
          const playing = playingOn?.playing === true;
          commandActive(playing ? "pause" : "play");
          actions.expectRemote({ playing: !playing });
        }
      : actions.togglePlay,
    next: mirroring ? () => commandActive("next") : actions.next,
    previous: mirroring ? () => commandActive("previous") : actions.previous,
    seekTo: mirroring
      ? (seconds: number) => {
          commandActive("seek", seconds);
          actions.expectRemote({ positionSeconds: seconds });
        }
      : actions.seekTo,
    playHere: actions.playHere,
    scrubTo: actions.scrubTo,
    setVolume: mirroring
      ? (volume: number) => {
          commandActive("setVolume", volume);
          actions.expectRemote({ volume, muted: false });
        }
      : actions.setVolume,
    toggleMute: mirroring
      ? () => {
          commandActive("toggleMute");
          actions.expectRemote({ muted: !(playingOn?.muted ?? false) });
        }
      : actions.toggleMute,
    toggleShuffle: mirroring
      ? () => {
          commandActive("toggleShuffle");
          actions.expectRemote({ shuffle: !(playingOn?.shuffle ?? false) });
        }
      : actions.toggleShuffle,
    cycleRepeat: mirroring
      ? () => {
          commandActive("cycleRepeat");
          actions.expectRemote({ repeat: nextRepeat(playingOn?.repeat ?? "off") });
        }
      : actions.cycleRepeat,
    toggleChain: actions.toggleChain,
    toggleLyrics: actions.toggleLyrics,
    toggleScrobbling,
    toggleMore: actions.toggleMore,
    toggleDevices: actions.toggleDevices,
    toggleFullscreen: actions.toggleFullscreen,
    toggleFavorite,
    handOverTo,
  };

  if (track === null || !session.started) return { view: null, actions: playerActions };

  const activeDevice = mirroring && mirrored !== null ? mirrored : here;
  const chainTranscoding = mirroring && playingOn !== null ? playingOn.transcoding : session.transcoding;

  const view: PlayerView = {
    track,
    positionSeconds:
      playingOn !== null && !session.playing ? mirroredPositionSeconds(playingOn, Date.now()) : session.positionSeconds,
    scrubSeconds: session.scrubSeconds,
    playing: mirroring && playingOn !== null ? playingOn.playing : session.playing,
    loading: mirroring ? false : session.loading,
    shuffle: mirroring && playingOn !== null ? playingOn.shuffle : session.shuffle,
    repeat: mirroring && playingOn !== null ? playingOn.repeat : session.repeat,
    volume: mirroring && playingOn !== null ? playingOn.volume : session.volume,
    muted: mirroring && playingOn !== null ? playingOn.muted : session.muted,
    devices,
    activeDevice,
    chain: {
      fileLabel: t("chain.fileValue", { format: track.format.toUpperCase(), bitrate: track.bitrateKbps }),
      transcoding: chainTranscoding,
      serverLabel: chainTranscoding ? t("chain.serverTranscoding") : t("chain.serverDirect"),
    },
    favorite,
    chainVisible: session.chainVisible,
    moreOpen: session.moreOpen,
    devicesOpen: session.devicesOpen,
    lyricsOpen: session.lyricsOpen,
    lyrics: lyrics.data ?? null,
    lyricsLoading: lyrics.isLoading,
    lyricsFailed: lyrics.isError,
    scrobble: scrobbleStateFrom(connections.data ?? []),
    scrobbleActionable: connected.length > 0,
    fullscreen: session.fullscreen,
    notice: session.notice,
  };

  return { view, actions: playerActions };
}

export { actions as playerActions, currentTrack };
