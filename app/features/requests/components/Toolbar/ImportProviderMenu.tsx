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
import { cn } from "@utils/cn";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import { FileJson, Library } from "lucide-react";
import { useState } from "react";

import {
  importProviderFileChip,
  importProviderMenuItem,
  importProviderMenuTrigger,
  importProviderSpotifyChip,
} from "./styles";

export function ImportProviderMenu() {
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [jspfOpen, setJspfOpen] = useState(false);

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
          <DropdownMenuItem onSelect={() => setSpotifyOpen(true)} className={importProviderMenuItem()}>
            <span className={importProviderSpotifyChip()}>
              <SpotifyMark />
            </span>
            <div className="flex flex-1 flex-col">
              <span>Spotify</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setJspfOpen(true)} className={importProviderMenuItem()}>
            <span className={importProviderFileChip()}>
              <FileJson className="size-3.5" />
            </span>
            <div className="flex flex-1 flex-col">
              <span>From file</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SpotifyLibraryModal open={spotifyOpen} onOpenChange={setSpotifyOpen} />
      <JspfImportModal open={jspfOpen} onOpenChange={setJspfOpen} />
    </>
  );
}
