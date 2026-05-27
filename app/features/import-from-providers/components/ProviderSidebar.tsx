"use client";

import { Music2 } from "lucide-react";

import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";

import { PROVIDERS } from "../constants";
import { sidebar, sidebarBadge, sidebarHeader, sidebarItem } from "../styles";

import { spotifyBadge } from "./helpers";
import type { ProviderSidebarProps } from "./types";

export function ProviderSidebar({ active, onChange }: ProviderSidebarProps) {
  const spotifyStatus = useSpotifyConnectionStatus();
  const spotifyConnected = spotifyStatus.data?.connected ?? false;
  const spotifyPending = spotifyStatus.data?.pending ?? false;

  return (
    <aside className={sidebar()}>
      <span className={sidebarHeader()}>Source</span>
      {PROVIDERS.map((provider) => {
        const badge =
          provider.key === "spotify"
            ? spotifyBadge(spotifyConnected, spotifyPending)
            : { label: "Off", tone: "neutral" as const };
        return (
          <button
            key={provider.key}
            type="button"
            className={sidebarItem({ active: active === provider.key })}
            onClick={() => onChange(provider.key)}
          >
            <span className="flex items-center gap-2">
              {provider.key === "spotify" && <Music2 className="size-4" />}
              {provider.label}
            </span>
            <span className={sidebarBadge({ tone: badge.tone })}>{badge.label}</span>
          </button>
        );
      })}
    </aside>
  );
}
