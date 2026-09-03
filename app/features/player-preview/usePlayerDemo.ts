"use client";

import type { PlayerDevice, PlayerNoticeTone, PlayerScrobbleStatus, PlayerView } from "@components/Player";
import type { PlayerActions } from "@components/Player";
import { nextRepeat, shouldRestart } from "@components/Player";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  DEMO_DEVICE_SEEDS,
  DEMO_INITIAL_QUEUE,
  DEMO_NORMALIZATION_GAIN,
  DEMO_TRACKS,
  LOADING_MS,
  NOTICE_MS,
  SKIP_DELAY_MS,
  TICK_MS,
} from "./constants";
import type { DemoDeviceId, PlayerDemo, PlayerDemoState } from "./types";

function nextScrobbleStatus(status: PlayerScrobbleStatus): PlayerScrobbleStatus {
  if (status === "idle") return "retrying";
  if (status === "retrying") return "failed";
  return "idle";
}

const INITIAL_STATE: PlayerDemoState = {
  index: 1,
  playing: true,
  started: true,
  loading: false,
  positionSeconds: 42,
  scrubSeconds: null,
  volume: 0.72,
  muted: false,
  shuffle: false,
  repeat: "off",
  favoriteIds: ["demo-2"],
  queueIds: DEMO_INITIAL_QUEUE,
  devicesOpen: false,
  fullscreen: false,
  chainVisible: false,
  deviceId: "here",
  scrobbleEnabled: true,
  scrobbleStatus: "retrying",
  transcoding: false,
  notice: null,
};

export function usePlayerDemo(): PlayerDemo {
  const { t } = useTranslation("player");
  const [state, setState] = useState<PlayerDemoState>(INITIAL_STATE);
  const stateRef = useRef(state);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const loadingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const skipTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const advanceRef = useRef<() => void>(() => undefined);

  stateRef.current = state;

  const notify = useCallback((text: string, tone: PlayerNoticeTone) => {
    setState((current) => ({ ...current, notice: { text, tone } }));
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => {
      setState((current) => ({ ...current, notice: null }));
    }, NOTICE_MS);
  }, []);

  const playIndex = useCallback(
    (index: number) => {
      const track = DEMO_TRACKS[index];
      if (track === undefined) return;
      if (track.missing) {
        notify(t("demo.cannotPlay", { title: track.title }), "danger");
        return;
      }
      setState((current) => ({
        ...current,
        index,
        positionSeconds: 0,
        scrubSeconds: null,
        playing: true,
        started: true,
        loading: true,
        transcoding: track.lossless && index % 5 === 0,
      }));
      clearTimeout(loadingTimer.current);
      loadingTimer.current = setTimeout(() => {
        setState((current) => ({ ...current, loading: false }));
      }, LOADING_MS);
    },
    [notify, t]
  );

  const advance = useCallback(
    (automatic: boolean) => {
      const current = stateRef.current;
      const playingTrack = DEMO_TRACKS[current.index];
      if (playingTrack === undefined) return;

      if (automatic && current.repeat === "one") {
        setState((previous) => ({ ...previous, positionSeconds: 0, playing: true }));
        return;
      }

      const remaining = current.queueIds.filter((id) => id !== playingTrack.id);
      const candidate = current.shuffle ? remaining[Math.floor(Math.random() * remaining.length)] : remaining[0];

      if (candidate === undefined) {
        if (current.repeat === "all") {
          setState((previous) => ({ ...previous, queueIds: DEMO_INITIAL_QUEUE }));
          playIndex(0);
          return;
        }
        setState((previous) => ({
          ...previous,
          playing: false,
          positionSeconds: playingTrack.durationSeconds,
        }));
        notify(t("demo.queueEnd"), "info");
        return;
      }

      const candidateIndex = DEMO_TRACKS.findIndex((track) => track.id === candidate);
      const candidateTrack = DEMO_TRACKS[candidateIndex];
      setState((previous) => ({ ...previous, queueIds: previous.queueIds.filter((id) => id !== candidate) }));

      if (candidateTrack !== undefined && candidateTrack.missing) {
        notify(t("demo.skipping", { title: candidateTrack.title }), "danger");
        clearTimeout(skipTimer.current);
        skipTimer.current = setTimeout(() => advanceRef.current(), SKIP_DELAY_MS);
        return;
      }

      playIndex(candidateIndex);
    },
    [notify, playIndex, t]
  );

  advanceRef.current = () => advance(true);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = stateRef.current;
      if (!current.playing || current.loading) return;
      const track = DEMO_TRACKS[current.index];
      if (track === undefined) return;
      const next = current.positionSeconds + TICK_MS / 1000;
      if (next >= track.durationSeconds) {
        advanceRef.current();
        return;
      }
      setState((previous) => ({ ...previous, positionSeconds: next }));
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  useEffect(
    () => () => {
      clearTimeout(noticeTimer.current);
      clearTimeout(loadingTimer.current);
      clearTimeout(skipTimer.current);
    },
    []
  );

  const deviceLabels: Record<DemoDeviceId, { name: string; detail: string }> = useMemo(
    () => ({
      here: { name: t("demo.devices.here"), detail: t("demo.devices.hereDetail") },
      desktop: { name: t("demo.devices.desktop"), detail: t("demo.devices.desktopDetail") },
      phone: { name: t("demo.devices.phone"), detail: t("demo.devices.phoneDetail") },
      laptop: { name: t("demo.devices.laptop"), detail: t("demo.devices.laptopDetail") },
    }),
    [t]
  );

  const devices: readonly PlayerDevice[] = useMemo(
    () =>
      DEMO_DEVICE_SEEDS.map((seed) => ({
        id: seed.id,
        kind: seed.kind,
        name: deviceLabels[seed.id].name,
        detail: deviceLabels[seed.id].detail,
        active: seed.id === state.deviceId,
        local: seed.local,
      })),
    [deviceLabels, state.deviceId]
  );

  const track = DEMO_TRACKS[state.index] ?? DEMO_TRACKS[0];
  const activeDevice = devices.find((device) => device.active) ?? devices[0];
  const serverLabel = state.transcoding ? t("chain.serverTranscoding") : t("chain.serverDirect");

  const view: PlayerView = {
    track,
    positionSeconds: state.positionSeconds,
    scrubSeconds: state.scrubSeconds,
    playing: state.playing,
    loading: state.loading,
    favorite: state.favoriteIds.includes(track.id),
    shuffle: state.shuffle,
    repeat: state.repeat,
    volume: state.volume,
    muted: state.muted,
    devices,
    activeDevice,
    chain: {
      fileLabel: `${track.format.toUpperCase()} · ${track.bitrateKbps}`,
      transcoding: state.transcoding,
      serverLabel,
      normalizationLabel: t("chain.normalizationAlbum", { gain: DEMO_NORMALIZATION_GAIN }),
    },
    scrobble: { enabled: state.scrobbleEnabled, status: state.scrobbleStatus },
    chainVisible: state.chainVisible,
    devicesOpen: state.devicesOpen,
    fullscreen: state.fullscreen,
    notice: state.notice,
  };

  const actions: PlayerActions = {
    togglePlay: () => {
      if (!state.started) {
        playIndex(state.index);
        return;
      }
      setState((current) => ({ ...current, playing: !current.playing }));
    },
    next: () => advance(false),
    previous: () => {
      if (shouldRestart(state.positionSeconds)) {
        setState((current) => ({ ...current, positionSeconds: 0 }));
        return;
      }
      playIndex(Math.max(0, state.index - 1));
    },
    seekTo: (seconds) => setState((current) => ({ ...current, positionSeconds: seconds, scrubSeconds: null })),
    scrubTo: (seconds) => setState((current) => ({ ...current, scrubSeconds: seconds })),
    setVolume: (volume) =>
      setState((current) => ({ ...current, volume: Math.min(1, Math.max(0, volume)), muted: false })),
    toggleMute: () => setState((current) => ({ ...current, muted: !current.muted })),
    toggleFavorite: () =>
      setState((current) => ({
        ...current,
        favoriteIds: current.favoriteIds.includes(track.id)
          ? current.favoriteIds.filter((id) => id !== track.id)
          : [...current.favoriteIds, track.id],
      })),
    toggleShuffle: () => setState((current) => ({ ...current, shuffle: !current.shuffle })),
    cycleRepeat: () =>
      setState((current) => ({
        ...current,
        repeat: nextRepeat(current.repeat),
      })),
    toggleDevices: () => setState((current) => ({ ...current, devicesOpen: !current.devicesOpen })),
    toggleChain: () => setState((current) => ({ ...current, chainVisible: !current.chainVisible })),
    toggleScrobble: () =>
      setState((current) => ({
        ...current,
        scrobbleEnabled: !current.scrobbleEnabled,
        scrobbleStatus: current.scrobbleEnabled ? current.scrobbleStatus : nextScrobbleStatus(current.scrobbleStatus),
      })),
    toggleFullscreen: () => setState((current) => ({ ...current, fullscreen: !current.fullscreen })),
    selectDevice: (id) => {
      const device = devices.find((candidate) => candidate.id === id);
      if (device === undefined) return;
      if (device.kind === "third") {
        notify(t("demo.deviceThird", { name: device.name }), "warning");
        return;
      }
      if (device.kind === "unarmed") {
        notify(t("demo.deviceUnarmed", { name: device.name }), "warning");
        return;
      }
      setState((current) => ({ ...current, deviceId: id, devicesOpen: false }));
      notify(id === "here" ? t("demo.deviceHere") : t("demo.deviceRemote", { name: device.name }), "info");
    },
    describeChain: () =>
      notify(
        t("chain.description", {
          file: view.chain.fileLabel,
          server: serverLabel,
          normalization: view.chain.normalizationLabel,
          device: activeDevice.name,
        }),
        state.transcoding ? "warning" : "info"
      ),
  };

  return {
    view,
    actions,
    tracks: DEMO_TRACKS,
    playTrack: (id) => {
      const index = DEMO_TRACKS.findIndex((candidate) => candidate.id === id);
      if (index < 0) return;
      playIndex(index);
    },
    addNext: (id) => {
      setState((current) => ({
        ...current,
        queueIds: [id, ...current.queueIds.filter((queued) => queued !== id)],
      }));
      notify(t("demo.addedNext"), "info");
    },
    addLast: (id) => {
      setState((current) => ({
        ...current,
        queueIds: [...current.queueIds.filter((queued) => queued !== id), id],
      }));
      notify(t("demo.addedLast"), "info");
    },
  };
}
