"use client";

import {
  useActivePlayback,
  useDeviceHeartbeat,
  useForgetDevice,
  usePublishPlaybackState,
  useSavePlaybackSession,
  useSendPlayerCommand,
} from "@hooks/api";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DEVICE_HEARTBEAT_MS,
  HAND_OVER_ACK_MS,
  POSITION_JUMP_SECONDS,
  PROGRESS_REPORT_MS,
  WAKE_BEAT_FLOOR_MS,
} from "./constants";
import { adoptSharedQueue, noteCommandIssued } from "./commands";
import { claimDeviceId, deviceIdentity, type DeviceIdentity } from "./device";
import { beatIsDue, expectedPosition, isMirroring, toneFor, trackSummary } from "./helpers";
import { actions, getSnapshot, sessionSnapshot, subscribe } from "./store";
import type { KnownDevice, RemoteCommand } from "./types";

export function usePlayerDevices(): {
  devices: KnownDevice[];
  handOverTo: (deviceId: string) => void;
  toggleRemote: (deviceId: string, playing: boolean) => void;
  commandActive: (command: RemoteCommand, value?: number) => void;
} {
  const [identity, setIdentity] = useState<DeviceIdentity | null>(null);
  const [devices, setDevices] = useState<KnownDevice[]>([]);
  const lastBeatAt = useRef(0);
  const knownIds = useRef(new Set<string>());
  const ackTimers = useRef<number[]>([]);
  const { mutate: sendHeartbeat } = useDeviceHeartbeat();
  const { mutate: forgetDevice } = useForgetDevice();
  const { mutate: saveSession } = useSavePlaybackSession();
  const { mutate: sendCommand } = useSendPlayerCommand();
  const { mutate: publishState } = usePublishPlaybackState();
  const active = useActivePlayback();
  const refreshActive = active.refetch;
  const lastPublished = useRef<{
    playing: boolean;
    trackId: string | null;
    positionSeconds: number;
    at: number;
    settings: string | null;
  }>({ playing: false, trackId: null, positionSeconds: 0, at: 0, settings: null });

  useEffect(() => {
    const release = claimDeviceId((id) => setIdentity({ ...deviceIdentity(), id }));
    setIdentity(deviceIdentity());
    const timers = ackTimers.current;
    return () => {
      release();
      for (const timer of timers) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (identity === null) return;
    const beat = () => {
      if (!beatIsDue(lastBeatAt.current, Date.now())) return;
      lastBeatAt.current = Date.now();
      const session = getSnapshot();
      sendHeartbeat(
        {
          deviceId: identity.id,
          name: identity.name,
          kind: identity.kind,
          armed: session.armed,
          playing: session.playing,
          trackTitle: session.queue[session.index]?.title ?? null,
        },
        {
          onSuccess: (known) => {
            knownIds.current = new Set(known.map((device) => device.id));
            setDevices(known.filter((device) => device.id !== identity.id));
          },
        }
      );
    };
    beat();
    const timer = window.setInterval(beat, DEVICE_HEARTBEAT_MS);
    const progress = window.setInterval(() => {
      const session = getSnapshot();
      if (!session.playing) return;
      lastPublished.current = { ...lastPublished.current, positionSeconds: session.positionSeconds, at: Date.now() };
      publishState({
        deviceId: identity.id,
        playing: true,
        track: trackSummary(session),
        positionSeconds: session.positionSeconds,
        shuffle: session.shuffle,
        repeat: session.repeat,
        volume: session.volume,
        muted: session.muted,
        transcoding: session.transcoding,
      });
    }, PROGRESS_REPORT_MS);
    const refreshOnStranger = subscribe(() => {
      const remote = getSnapshot().remote;
      if (remote === null || knownIds.current.has(remote.deviceId)) return;
      knownIds.current.add(remote.deviceId);
      lastBeatAt.current = 0;
      beat();
    });
    const wakeUp = () => {
      if (document.visibilityState !== "visible") return;
      actions.resync();
      if (Date.now() - lastBeatAt.current > WAKE_BEAT_FLOOR_MS) {
        lastBeatAt.current = 0;
        beat();
        void refreshActive();
      }
    };
    document.addEventListener("visibilitychange", wakeUp);
    window.addEventListener("pageshow", wakeUp);
    window.addEventListener("focus", wakeUp);

    const leave = () => {
      const session = getSnapshot();
      if (session.playing) {
        publishState({
          deviceId: identity.id,
          playing: false,
          track: trackSummary(session),
          positionSeconds: session.positionSeconds,
          shuffle: session.shuffle,
          repeat: session.repeat,
          volume: session.volume,
          muted: session.muted,
          transcoding: session.transcoding,
        });
      }
      forgetDevice({ deviceId: identity.id });
    };
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearInterval(timer);
      window.clearInterval(progress);
      refreshOnStranger();
      document.removeEventListener("visibilitychange", wakeUp);
      window.removeEventListener("pageshow", wakeUp);
      window.removeEventListener("focus", wakeUp);
      window.removeEventListener("pagehide", leave);
    };
  }, [identity, sendHeartbeat, forgetDevice, publishState, refreshActive]);

  useEffect(() => {
    if (identity === null) return;
    return subscribe(() => {
      const session = getSnapshot();
      const current = session.queue[session.index] ?? null;
      const trackId = current?.id ?? null;
      const previous = lastPublished.current;
      const settings = `${session.shuffle}:${session.repeat}:${session.volume}:${session.muted}:${session.transcoding}:${Math.round(session.durationSeconds)}`;
      const drifted =
        Math.abs(session.positionSeconds - expectedPosition(previous, Date.now())) > POSITION_JUMP_SECONDS;
      if (
        session.playing === previous.playing &&
        trackId === previous.trackId &&
        settings === previous.settings &&
        !drifted
      )
        return;

      lastPublished.current = {
        playing: session.playing,
        trackId,
        positionSeconds: session.positionSeconds,
        at: Date.now(),
        settings,
      };
      publishState({
        deviceId: identity.id,
        playing: session.playing,
        track: trackSummary(session),
        positionSeconds: session.positionSeconds,
        shuffle: session.shuffle,
        repeat: session.repeat,
        volume: session.volume,
        muted: session.muted,
        transcoding: session.transcoding,
      });
    });
  }, [identity, publishState]);

  useEffect(() => {
    const snapshot = active.data;
    if (identity === null || snapshot === undefined || snapshot === null) return;
    if (snapshot.deviceId === identity.id || !snapshot.playing) return;
    actions.applyRemoteState({
      deviceId: snapshot.deviceId,
      deviceName: snapshot.deviceName,
      playing: snapshot.playing,
      track: snapshot.track === null ? null : { ...snapshot.track, tone: toneFor(snapshot.track.id) },
      confirmed: true,
      positionSeconds: snapshot.positionSeconds + snapshot.reportedSecondsAgo,
      shuffle: snapshot.shuffle,
      repeat: snapshot.repeat,
      volume: snapshot.volume,
      muted: snapshot.muted,
      transcoding: snapshot.transcoding,
      updatedAt: Date.now(),
    });
    if (snapshot.track !== null) adoptSharedQueue(snapshot.track.id);
  }, [active.data, identity]);

  const commandActive = useCallback(
    (command: RemoteCommand, value?: number) => {
      const remote = getSnapshot().remote;
      if (remote === null) return;
      sendCommand(
        {
          deviceId: remote.deviceId,
          command,
          seekSeconds: command === "seek" ? value : undefined,
          volumeLevel: command === "setVolume" ? value : undefined,
        },
        {
          onSuccess: (result) => {
            if (result.issuedAt !== null) noteCommandIssued(result.issuedAt);
            if (result.delivered) return;
            actions.forgetRemote();
            void refreshActive();
          },
        }
      );
    },
    [sendCommand, refreshActive]
  );

  const forgetLocally = useCallback((deviceId: string) => {
    setDevices((known) => known.filter((device) => device.id !== deviceId));
    actions.announceDeviceGone();
  }, []);

  const toggleRemote = useCallback(
    (deviceId: string, playing: boolean) => {
      sendCommand(
        { deviceId, command: playing ? "pause" : "play" },
        { onSuccess: (result) => (result.delivered ? undefined : forgetLocally(deviceId)) }
      );
      setDevices((known) =>
        known.map((device) => (device.id === deviceId ? { ...device, playing: !playing } : device))
      );
    },
    [sendCommand, forgetLocally]
  );

  const handOverTo = useCallback(
    (deviceId: string) => {
      const mirroring = isMirroring(getSnapshot());
      const snapshot = sessionSnapshot();
      if (!mirroring && snapshot.trackIds.length === 0) return;

      const command = () =>
        sendCommand(
          { deviceId, command: "handOver" },
          {
            onSuccess: (result) => {
              if (!result.delivered) {
                forgetLocally(deviceId);
                return;
              }
              const session = getSnapshot();
              if (session.remote !== null) return;
              actions.applyRemoteState({
                confirmed: false,
                deviceId,
                deviceName: devices.find((device) => device.id === deviceId)?.name ?? deviceId,
                playing: true,
                track: session.queue[session.index] ?? null,
                positionSeconds: session.positionSeconds,
                shuffle: session.shuffle,
                repeat: session.repeat,
                volume: session.volume,
                muted: session.muted,
                transcoding: session.transcoding,
                updatedAt: Date.now(),
              });
              ackTimers.current.push(
                window.setTimeout(() => actions.recoverUnconfirmedHandOver(deviceId), HAND_OVER_ACK_MS)
              );
            },
          }
        );

      if (mirroring) {
        command();
        return;
      }
      saveSession(snapshot, { onSuccess: command });
    },
    [saveSession, sendCommand, forgetLocally, devices]
  );

  return { devices, handOverTo, toggleRemote, commandActive };
}
