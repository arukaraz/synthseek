"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { JspfImportModal } from "@features/jspf-import";
import { SpotifyLibraryModal, SpotifyMark } from "@features/spotify-library";
import { useSpotifyConnectionStatus } from "@hooks/api/queries/spotify/useSpotifyConnectionStatus";
import { usePublicConfig } from "@hooks/api/queries/usePublicConfig";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { cn } from "@utils/cn";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink, FileJson, Library } from "lucide-react";
import { useState } from "react";

import { deriveSpotifyState, tooltipForState } from "./helpers";
import {
  importProviderFileChip,
  importProviderMenuItem,
  importProviderMenuTrigger,
  importProviderSpotifyChip,
  importProviderTooltip,
} from "./styles";

export function ImportProviderMenu() {
  const [open, setOpen] = useState(false);
  const [jspfOpen, setJspfOpen] = useState(false);
  const config = usePublicConfig();
  const status = useSpotifyConnectionStatus();
  const { isAdmin } = useAuthContext();

  const spotifyEnabled = config.data?.spotify.enabled ?? false;
  const configured = config.data?.spotify.configured ?? false;
  const connected = status.data?.connected ?? false;
  const pending = status.data?.pending ?? false;
  const spotifyState = deriveSpotifyState(configured, connected, pending);
  const spotifyDisabled = spotifyState === "not_configured";
  const showSpotifyHint = spotifyDisabled || spotifyState === "pending";

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
            title="Import library"
            aria-label="Import library"
          >
            <Library className="size-3.5" />
            <span className="hidden sm:inline">Import library</span>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel>Sources</DropdownMenuLabel>
          {spotifyEnabled ? (
            <DropdownMenuItem
              disabled={spotifyDisabled}
              onSelect={() => {
                if (!spotifyDisabled) setOpen(true);
              }}
              className={importProviderMenuItem()}
            >
              <span className={importProviderSpotifyChip()}>
                <SpotifyMark />
              </span>
              <div className="flex flex-1 flex-col">
                <span>Spotify</span>
                {showSpotifyHint && (
                  <span className={importProviderTooltip()}>{tooltipForState(spotifyState, isAdmin)}</span>
                )}
              </div>
              {spotifyDisabled && isAdmin && (
                <Link
                  href="/settings/integrations/metadata"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-300 hover:text-primary-200 inline-flex items-center gap-1 text-[11px]"
                >
                  Configure
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled className={importProviderMenuItem()}>
              <div className="flex flex-1 flex-col">
                <span>No sources enabled</span>
                {isAdmin && (
                  <span className={importProviderTooltip()}>
                    Enable a source in Settings → Metadata → Library Sources
                  </span>
                )}
              </div>
              {isAdmin && (
                <Link
                  href="/settings/integrations/metadata"
                  onClick={(e) => e.stopPropagation()}
                  className="text-primary-300 hover:text-primary-200 inline-flex items-center gap-1 text-[11px]"
                >
                  Configure
                  <ExternalLink className="size-3" />
                </Link>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuLabel>File</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setJspfOpen(true)} className={importProviderMenuItem()}>
            <span className={importProviderFileChip()}>
              <FileJson className="size-3.5" />
            </span>
            <div className="flex flex-1 flex-col">
              <span>From file (JSPF)</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SpotifyLibraryModal open={open} onOpenChange={setOpen} />
      <JspfImportModal open={jspfOpen} onOpenChange={setJspfOpen} />
    </>
  );
}
