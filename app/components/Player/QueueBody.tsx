"use client";

import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { useRenderWindow } from "@hooks/ui/useRenderWindow";
import { motion, Reorder } from "framer-motion";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { QUEUE_WINDOW_KEY } from "./constants";
import { mergeReorderedWindow } from "./helpers";
import { QueueRow } from "./QueueRow";
import { queueCaption, queueEmpty, queueList, queueSentinel } from "./styles";
import type { PlayerQueueBodyProps, PlayerTrack } from "./types";

export function QueueBody({ view, actions }: PlayerQueueBodyProps) {
  const { t } = useTranslation("player");
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const { playing, upNext, autoplay } = view.queue;
  const window = useRenderWindow(upNext, QUEUE_WINDOW_KEY);
  const order = window.visible.map((entry) => entry.track);
  const sentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage: window.hasMore,
    isFetchingNextPage: false,
    onLoadMore: window.loadMore,
  });

  const handleReorder = (next: PlayerTrack[]) => {
    actions.reorderQueue([...mergeReorderedWindow(next, upNext), ...autoplay.map((entry) => entry.track)]);
  };

  return (
    <motion.div ref={setScrollRoot} layoutScroll className={queueList()}>
      {playing === null ? null : (
        <>
          <span className={queueCaption()}>{t("queue.nowPlaying")}</span>
          <QueueRow entry={playing} current editable={false} actions={actions} />
        </>
      )}
      {upNext.length === 0 && autoplay.length > 0 ? null : <span className={queueCaption()}>{t("queue.upNext")}</span>}
      {upNext.length === 0 ? (
        autoplay.length > 0 ? null : (
          <span className={queueEmpty()}>{t("queue.empty")}</span>
        )
      ) : (
        <Reorder.Group axis="y" values={order} onReorder={handleReorder} as="div">
          {window.visible.map((entry) => (
            <QueueRow
              key={entry.track.id}
              entry={entry}
              current={false}
              editable={view.queueEditable}
              actions={actions}
            />
          ))}
        </Reorder.Group>
      )}
      {window.hasMore ? <div ref={sentinelRef} className={queueSentinel()} /> : null}
      {autoplay.length === 0 ? null : (
        <>
          <span className={queueCaption()}>{t("queue.autoplay")}</span>
          {autoplay.map((entry) => (
            <QueueRow
              key={entry.track.id}
              entry={entry}
              current={false}
              editable={false}
              removable={view.queueEditable}
              actions={actions}
            />
          ))}
        </>
      )}
    </motion.div>
  );
}
