"use client";

import type { PlayerActions, PlayerDevice, PlayerView } from "@components/Player";
import { useEffect, useSyncExternalStore } from "react";
import { useTranslation } from "react-i18next";

import { actions, currentTrack, getSnapshot, setMessages, subscribe } from "./store";
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
  const track = session.queue[session.index] ?? null;

  useEffect(() => {
    setMessages({
      skipping: (title) => t("notice.skipping", { title }),
      queueEnd: t("notice.queueEnd"),
      autoplayBlocked: t("notice.autoplayBlocked"),
      tooManyFailures: t("notice.tooManyFailures"),
    });
  }, [t]);

  useEffect(() => {
    actions.restoreVolume();
  }, []);

  const device: PlayerDevice = {
    id: "here",
    name: t("devices.thisBrowser"),
    detail: t("devices.thisBrowserDetail"),
    active: true,
    local: true,
  };

  const playerActions: PlayerActions = {
    togglePlay: actions.togglePlay,
    next: actions.next,
    previous: actions.previous,
    seekTo: actions.seekTo,
    scrubTo: actions.scrubTo,
    setVolume: actions.setVolume,
    toggleMute: actions.toggleMute,
    toggleShuffle: actions.toggleShuffle,
    cycleRepeat: actions.cycleRepeat,
    toggleChain: actions.toggleChain,
    toggleMore: actions.toggleMore,
    toggleDevices: actions.toggleDevices,
    toggleFullscreen: actions.toggleFullscreen,
  };

  if (track === null || !session.started) return { view: null, actions: playerActions };

  const view: PlayerView = {
    track,
    positionSeconds: session.positionSeconds,
    scrubSeconds: session.scrubSeconds,
    playing: session.playing,
    loading: session.loading,
    shuffle: session.shuffle,
    repeat: session.repeat,
    volume: session.volume,
    muted: session.muted,
    devices: [device],
    activeDevice: device,
    chain: {
      fileLabel: t("chain.fileValue", { format: track.format.toUpperCase(), bitrate: track.bitrateKbps }),
      transcoding: session.transcoding,
      serverLabel: session.transcoding ? t("chain.serverTranscoding") : t("chain.serverDirect"),
    },
    chainVisible: session.chainVisible,
    moreOpen: session.moreOpen,
    devicesOpen: session.devicesOpen,
    fullscreen: session.fullscreen,
    notice: session.notice,
  };

  return { view, actions: playerActions };
}

export { actions as playerActions, currentTrack };
