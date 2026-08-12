"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { DropImportModal } from "@features/drop-import";
import { JspfImportModal } from "@features/jspf-import";
import { SpotifyLibraryModal, SpotifyMark } from "@features/spotify-library";
import { cn } from "@utils/cn";
import { primaryGradientButton } from "@theme/utilities/styles";
import { motion } from "framer-motion";
import { FileJson, FileUp, Library } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import {
  importProviderFileChip,
  importProviderMenuItem,
  importProviderMenuTrigger,
  importProviderSpotifyChip,
} from "./styles";

export function ImportProviderMenu() {
  const { t } = useTranslation("requests");
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const [jspfOpen, setJspfOpen] = useState(false);
  const [dropImportOpen, setDropImportOpen] = useState(false);

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
            title={t("toolbar.import.trigger")}
            aria-label={t("toolbar.import.trigger")}
          >
            <Library className="size-3.5" />
            <span className="hidden sm:inline">{t("toolbar.import.trigger")}</span>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-64">
          <DropdownMenuLabel>{t("toolbar.import.sourcesLabel")}</DropdownMenuLabel>
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
              <span>{t("toolbar.import.playlistFile")}</span>
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDropImportOpen(true)} className={importProviderMenuItem()}>
            <span className={importProviderFileChip()}>
              <FileUp className="size-3.5" />
            </span>
            <div className="flex flex-1 flex-col">
              <span>{t("toolbar.import.audioFiles")}</span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SpotifyLibraryModal open={spotifyOpen} onOpenChange={setSpotifyOpen} />
      <JspfImportModal open={jspfOpen} onOpenChange={setJspfOpen} />
      <DropImportModal open={dropImportOpen} onOpenChange={setDropImportOpen} />
    </>
  );
}
