import type { PlaybackStatePayload, PlayerCommandPayload } from "@api/__generated__/types";

import { deviceIdentity } from "./device";
import { toneFor } from "./helpers";
import { actions } from "./store";

let takeOverHandler: (() => void) | null = null;
let unknownTrackHandler: ((trackId: string) => void) | null = null;
let lastCommandAt = 0;
let lastStateAt = 0;

export function setTakeOverHandler(handler: (() => void) | null): void {
  takeOverHandler = handler;
}

export function setUnknownTrackHandler(handler: ((trackId: string) => void) | null): void {
  unknownTrackHandler = handler;
}

export function noteCommandIssued(issuedAt: number): void {
  lastStateAt = Math.max(lastStateAt, issuedAt);
}

export function adoptSharedQueue(trackId: string): void {
  unknownTrackHandler?.(trackId);
}

export function applyPlayerCommand(command: PlayerCommandPayload): void {
  if (command.deviceId !== deviceIdentity().id) return;
  if (command.issuedAt < lastCommandAt) return;
  lastCommandAt = command.issuedAt;

  switch (command.command) {
    case "handOver":
      takeOverHandler?.();
      return;
    case "play":
      actions.resumeHere();
      return;
    case "pause":
      actions.pauseHere();
      return;
    case "next":
      actions.next();
      return;
    case "previous":
      actions.previous();
      return;
    case "seek":
      if (command.seekSeconds !== undefined) actions.seekTo(command.seekSeconds);
      return;
    case "toggleShuffle":
      actions.toggleShuffle();
      return;
    case "cycleRepeat":
      actions.cycleRepeat();
      return;
    case "toggleMute":
      actions.toggleMute();
      return;
    case "setVolume":
      if (command.volumeLevel !== undefined) actions.setVolume(command.volumeLevel);
      return;
  }
}

export function applyPlaybackState(state: PlaybackStatePayload): void {
  if (state.deviceId === deviceIdentity().id) return;
  if (state.issuedAt < lastStateAt) return;
  lastStateAt = state.issuedAt;

  actions.applyRemoteState({
    deviceId: state.deviceId,
    deviceName: state.deviceName,
    playing: state.playing,
    track: state.track === null ? null : { ...state.track, tone: toneFor(state.track.id) },
    confirmed: true,
    positionSeconds: state.positionSeconds,
    shuffle: state.shuffle,
    repeat: state.repeat,
    volume: state.volume,
    muted: state.muted,
    transcoding: state.transcoding,
    updatedAt: Date.now(),
  });

  if (state.playing && state.track !== null) unknownTrackHandler?.(state.track.id);
}
