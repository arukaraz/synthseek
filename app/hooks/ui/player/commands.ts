import type { PlaybackStatePayload, PlayerCommandPayload } from "@api/__generated__/types";

import { deviceIdentity } from "./device";
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
    trackId: state.trackId,
    positionSeconds: state.positionSeconds,
    updatedAt: Date.now(),
  });

  if (state.playing && state.trackId !== null) unknownTrackHandler?.(state.trackId);
}
