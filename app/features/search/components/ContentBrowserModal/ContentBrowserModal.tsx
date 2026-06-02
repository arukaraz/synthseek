"use client";

import { Dialog, DialogContent, DialogTitle } from "@components/ui/Dialog";
import { ContentType, type MusicItem } from "@api/__generated__/types";
import { modalContainer } from "../styles";
import { useCallback } from "react";
import { HeroHeader } from "./HeroHeader";
import { ContentList } from "./ContentList";
import { useContentBrowser } from "./hooks/useContentBrowser";
import type { ContentBrowserModalProps, RequestContext } from "./types";

export function ContentBrowserModal({
  type,
  data,
  open,
  onClose,
  onRequestClick,
  preloadedItems,
  requestButtonDisabled,
  requestButtonTooltip,
}: ContentBrowserModalProps) {
  const { metadata, items, isLoading, canGoBack, currentType, currentData, handleRowClick, handleBack } =
    useContentBrowser({
      initialType: type,
      initialData: data,
      preloadedItems,
    });

  const handleRequestWithContext = useCallback(
    (item: MusicItem) => {
      const context: RequestContext = {};

      if (currentType === ContentType.enum.album && item.type === ContentType.enum.track) {
        context.parentAlbum = currentData;
      }

      onRequestClick(item, context);
    },
    [currentType, currentData, onRequestClick]
  );

  const sectionTitle = currentType === ContentType.enum.artist ? "Albums" : "Tracks";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        data-cy="content-browser-modal"
        className={modalContainer()}
        aria-describedby="content-browser-description"
      >
        <DialogTitle className="sr-only">
          {metadata.title} - {sectionTitle}
        </DialogTitle>

        <div id="content-browser-description" className="sr-only">
          Browse and request {sectionTitle.toLowerCase()} from {metadata.title}
        </div>

        <div className="flex-shrink-0">
          <HeroHeader
            metadata={metadata}
            type={currentType}
            onRequestAll={() => handleRequestWithContext(currentData)}
            onBack={canGoBack ? handleBack : undefined}
            requestButtonDisabled={requestButtonDisabled}
            requestButtonTooltip={requestButtonTooltip}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
          <ContentList
            type={currentType}
            items={items}
            isLoading={isLoading}
            onActionClick={handleRequestWithContext}
            onNavigate={handleRowClick}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
