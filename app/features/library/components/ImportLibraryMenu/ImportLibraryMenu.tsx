"use client";

import { LibrarySourceModal, ProviderMark, providerTone } from "@components/LibrarySourceModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { DropImportModal } from "@features/drop-import";
import { JspfImportModal } from "@features/jspf-import";
import type { LibrarySourceProvider } from "@hooks/api/queries/library-source/types";
import { useLibrarySources } from "@hooks/api/queries/library-source/useLibrarySources";
import { primaryGradientButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { FileJson, FileUp, Library } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { importChip, importMenuItem, importTrigger } from "./styles";

export function ImportLibraryMenu() {
  const { t } = useTranslation("library");
  const sources = useLibrarySources();
  const configuredSources = (sources.data ?? []).filter((source) => source.configured);
  const [activeProvider, setActiveProvider] = useState<LibrarySourceProvider | null>(null);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [jspfOpen, setJspfOpen] = useState(false);
  const [dropImportOpen, setDropImportOpen] = useState(false);

  const openSource = (provider: LibrarySourceProvider) => {
    setActiveProvider(provider);
    setSourceOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.button
            type="button"
            className={cn(primaryGradientButton({ size: "sm", glow: "primary", hover: "lighten" }), importTrigger())}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            title={t("page.toolbar.import.trigger")}
            aria-label={t("page.toolbar.import.trigger")}
          >
            <Library className="size-3.5" />
            <span className="hidden sm:inline">{t("page.toolbar.import.trigger")}</span>
          </motion.button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="min-w-64">
          {configuredSources.length > 0 ? (
            <>
              <DropdownMenuLabel>{t("page.toolbar.import.sourcesLabel")}</DropdownMenuLabel>
              {configuredSources.map((source) => (
                <DropdownMenuItem
                  key={source.provider}
                  onSelect={() => openSource(source.provider)}
                  className={importMenuItem()}
                >
                  <span className={cn(importChip({ kind: "provider" }), providerTone({ provider: source.provider }))}>
                    <ProviderMark provider={source.provider} />
                  </span>
                  <span className="flex-1">{source.name}</span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          ) : null}
          <DropdownMenuLabel>{t("page.toolbar.import.filesLabel")}</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setJspfOpen(true)} className={importMenuItem()}>
            <span className={importChip({ kind: "file" })}>
              <FileJson className="size-3.5" />
            </span>
            <span className="flex-1">{t("page.toolbar.import.playlist")}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDropImportOpen(true)} className={importMenuItem()}>
            <span className={importChip({ kind: "file" })}>
              <FileUp className="size-3.5" />
            </span>
            <span className="flex-1">{t("page.toolbar.import.audio")}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeProvider ? (
        <LibrarySourceModal provider={activeProvider} open={sourceOpen} onOpenChange={setSourceOpen} />
      ) : null}
      <JspfImportModal open={jspfOpen} onOpenChange={setJspfOpen} />
      <DropImportModal open={dropImportOpen} onOpenChange={setDropImportOpen} />
    </>
  );
}
