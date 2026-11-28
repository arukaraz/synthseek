"use client";

import type { MediaConnectStepProps } from "../types";
import { JellyfinConnectStep } from "./JellyfinConnectStep";
import { NavidromeConnectStep } from "./NavidromeConnectStep";
import { PlexConnectStep } from "./PlexConnectStep";

export function MediaConnectStep({ server, onGo }: MediaConnectStepProps) {
  switch (server) {
    case "plex":
      return <PlexConnectStep onGo={onGo} />;
    case "navidrome":
      return <NavidromeConnectStep onGo={onGo} />;
    case "jellyfin":
      return <JellyfinConnectStep onGo={onGo} />;
  }
}
