"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { SpotifyLibraryModal } from "@features/spotify-library";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { useSettings } from "@hooks/api/queries/useSettings";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, Library, Music2 } from "lucide-react";
import { useState } from "react";

import { deriveSpotifyState, tooltipForState } from "./helpers";
import { importProviderMenuItem, importProviderMenuTrigger, importProviderSpotifyChip, importProviderTooltip } from "./styles";

export function ImportProviderMenu() {
  const [open, setOpen] = useState(false);
  const settings = useSettings();
  const status = useSpotifyConnectionStatus();
  const { isAdmin } = useAuthContext();

  const configured = Boolean(
    settings.data?.connections.spotify.clientId && settings.data?.connections.spotify.publicBaseUrl
  );
  const connected = status.data?.connected ?? false;
  const pending = status.data?.pending ?? false;
  const spotifyState = deriveSpotifyState(configured, connected, pending);
  const spotifyDisabled = spotifyState !== "ready";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            type="button"
            className={cn(
              primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" }),
              importProviderMenuTrigger()
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title="Manage external content"
            aria-label="Manage external content"
          >
            <Library className="size-3.5" />
            <span className="hidden sm:inline">Manage external content</span>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuItem
            disabled={spotifyDisabled}
            onSelect={() => {
              if (!spotifyDisabled) setOpen(true);
            }}
            className={importProviderMenuItem()}
          >
            <span className={importProviderSpotifyChip()}>
              <Music2 className="size-3.5" />
            </span>
            <div className="flex flex-1 flex-col">
              <span>Spotify</span>
              {spotifyDisabled && (
                <span className={importProviderTooltip()}>{tooltipForState(spotifyState, isAdmin)}</span>
              )}
            </div>
            {spotifyDisabled && isAdmin && (
              <Link
                href="/settings/integrations/spotify"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-[11px] text-primary-300 hover:text-primary-200"
              >
                Configure
                <ExternalLink className="size-3" />
              </Link>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SpotifyLibraryModal open={open} onOpenChange={setOpen} />
    </>
  );
}
