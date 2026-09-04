"use client";

import {
  useDeviceHeartbeat,
  useForgetDevice,
  usePublishPlaybackState,
  useSavePlaybackSession,
  useSendPlayerCommand,
} from "@hooks/api";
import { useCallback, useEffect, useRef, useState } from "react";

import { DEVICE_HEARTBEAT_MS, POSITION_JUMP_SECONDS } from "./constants";
import { claimDeviceId, deviceIdentity } from "./device";
import { beatIsDue, expectedPosition } from "./helpers";
import { actions, getSnapshot, sessionSnapshot, subscribe } from "./store";
import type { KnownDevice } from "./types";

export function usePlayerDevices(): {
  devices: KnownDevice[];
  handOverTo: (deviceId: string) => void;
  toggleRemote: (deviceId: string, playing: boolean) => void;
  commandActive: (command: "play" | "pause" | "next" | "previous" | "seek", seekSeconds?: number) => void;
} {
  const [identity, setIdentity] = useState<{ id: string; name: string } | null>(null);
  const [devices, setDevices] = useState<KnownDevice[]>([]);
  const lastBeatAt = useRef(0);
  const { mutate: sendHeartbeat } = useDeviceHeartbeat();
  const { mutate: forgetDevice } = useForgetDevice();
  const { mutate: saveSession } = useSavePlaybackSession();
  const { mutate: sendCommand } = useSendPlayerCommand();
  const { mutate: publishState } = usePublishPlaybackState();
  const lastPublished = useRef<{ playing: boolean; trackId: string | null; positionSeconds: number; at: number }>({
    playing: false,
    trackId: null,
    positionSeconds: 0,
    at: 0,
  });

  useEffect(() => {
    const release = claimDeviceId((id) => setIdentity({ id, name: deviceIdentity().name }));
    setIdentity(deviceIdentity());
    return release;
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
          armed: session.armed,
          playing: session.playing,
          trackTitle: session.queue[session.index]?.title ?? null,
        },
        { onSuccess: (known) => setDevices(known.filter((device) => device.id !== identity.id)) }
      );
    };
    beat();
    const timer = window.setInterval(beat, DEVICE_HEARTBEAT_MS);
    const leave = () => forgetDevice({ deviceId: identity.id });
    window.addEventListener("pagehide", leave);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("pagehide", leave);
    };
  }, [identity, sendHeartbeat, forgetDevice]);

  useEffect(() => {
    if (identity === null) return;
    return subscribe(() => {
      const session = getSnapshot();
      const trackId = session.queue[session.index]?.id ?? null;
      const previous = lastPublished.current;
      const drifted =
        Math.abs(session.positionSeconds - expectedPosition(previous, Date.now())) > POSITION_JUMP_SECONDS;
      if (session.playing === previous.playing && trackId === previous.trackId && !drifted) return;

      lastPublished.current = {
        playing: session.playing,
        trackId,
        positionSeconds: session.positionSeconds,
        at: Date.now(),
      };
      publishState({
        deviceId: identity.id,
        playing: session.playing,
        trackId,
        trackTitle: session.queue[session.index]?.title ?? null,
        positionSeconds: session.positionSeconds,
      });
    });
  }, [identity, publishState]);

  const commandActive = useCallback(
    (command: "play" | "pause" | "next" | "previous" | "seek", seekSeconds?: number) => {
      const remote = getSnapshot().remote;
      if (remote === null) return;
      sendCommand(
        { deviceId: remote.deviceId, command, seekSeconds },
        { onSuccess: (result) => (result.delivered ? undefined : actions.forgetRemote()) }
      );
    },
    [sendCommand]
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
      const snapshot = sessionSnapshot();
      if (snapshot.trackIds.length === 0) return;
      saveSession(snapshot, {
        onSuccess: () => {
          sendCommand(
            { deviceId, command: "handOver" },
            {
              onSuccess: (result) => {
                if (!result.delivered) {
                  forgetLocally(deviceId);
                  return;
                }
                actions.pauseHere();
              },
            }
          );
        },
      });
    },
    [saveSession, sendCommand, forgetLocally]
  );

  return { devices, handOverTo, toggleRemote, commandActive };
}
