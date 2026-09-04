import type { PlayerCommandPayload } from "@api/__generated__/types";

import { deviceIdentity } from "./device";
import { actions } from "./store";

let takeOverHandler: (() => void) | null = null;
let lastCommandAt = 0;

export function setTakeOverHandler(handler: (() => void) | null): void {
  takeOverHandler = handler;
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
  }
}
