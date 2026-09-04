"use client";

import type { PlayerActions, PlayerDevice, PlayerView } from "@components/Player";
import { useFavoriteTracks, useSetFavoriteTrack } from "@hooks/api";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { mirroredPositionSeconds } from "./helpers";
import { actions, currentTrack, getSnapshot, setMessages, subscribe } from "./store";
import { usePlayerDevices } from "./useDevices";
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
  const { devices: known, handOverTo, toggleRemote, commandActive } = usePlayerDevices();
  const mirroring = session.remote !== null && session.remote.playing;
  const mirroredIndex = session.queue.findIndex((entry) => entry.id === session.remote?.trackId);
  const track = (mirroring && mirroredIndex >= 0 ? session.queue[mirroredIndex] : session.queue[session.index]) ?? null;
  const favorites = useFavoriteTracks(track === null ? [] : [track.id]);
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
    detail: mirroring ? t("devices.idle") : t("devices.thisBrowserDetail"),
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
          detail: playingOn.playing ? t("devices.playing", { title: track?.title ?? "" }) : t("devices.idle"),
          active: mirroring,
          local: false,
          armed: true,
          playing: playingOn.playing,
        };

  const devices: PlayerDevice[] = [
    here,
    ...(mirrored !== null && !known.some((device) => device.id === mirrored.id) ? [mirrored] : []),
    ...known.map((device) => ({
      id: device.id,
      name: device.name,
      detail: device.playing
        ? t("devices.playing", { title: device.trackTitle ?? "" })
        : device.armed
          ? t("devices.idle")
          : t("devices.notArmed"),
      active: mirroring && device.id === playingOn?.deviceId,
      local: false,
      armed: device.armed,
      playing: device.playing,
    })),
  ];

  const playerActions: PlayerActions = {
    togglePlay: mirroring ? () => commandActive(playingOn?.playing === true ? "pause" : "play") : actions.togglePlay,
    next: mirroring ? () => commandActive("next") : actions.next,
    previous: mirroring ? () => commandActive("previous") : actions.previous,
    seekTo: mirroring ? (seconds: number) => commandActive("seek", seconds) : actions.seekTo,
    scrubTo: actions.scrubTo,
    setVolume: actions.setVolume,
    toggleMute: actions.toggleMute,
    toggleShuffle: actions.toggleShuffle,
    cycleRepeat: actions.cycleRepeat,
    toggleChain: actions.toggleChain,
    toggleMore: actions.toggleMore,
    toggleDevices: actions.toggleDevices,
    toggleFullscreen: actions.toggleFullscreen,
    toggleFavorite,
    handOverTo,
    toggleRemote,
  };

  if (track === null || !session.started) return { view: null, actions: playerActions };

  const activeDevice = mirroring && mirrored !== null ? mirrored : here;

  const view: PlayerView = {
    track,
    positionSeconds:
      playingOn !== null && !session.playing ? mirroredPositionSeconds(playingOn, Date.now()) : session.positionSeconds,
    scrubSeconds: session.scrubSeconds,
    playing: mirroring ? true : session.playing,
    loading: mirroring ? false : session.loading,
    shuffle: session.shuffle,
    repeat: session.repeat,
    volume: session.volume,
    muted: session.muted,
    devices,
    activeDevice,
    chain: {
      fileLabel: t("chain.fileValue", { format: track.format.toUpperCase(), bitrate: track.bitrateKbps }),
      transcoding: session.transcoding,
      serverLabel: session.transcoding ? t("chain.serverTranscoding") : t("chain.serverDirect"),
    },
    favorite,
    chainVisible: session.chainVisible,
    moreOpen: session.moreOpen,
    devicesOpen: session.devicesOpen,
    fullscreen: session.fullscreen,
    notice: session.notice,
  };

  return { view, actions: playerActions };
}

export { actions as playerActions, currentTrack };
