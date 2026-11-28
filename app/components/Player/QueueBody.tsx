"use client";

import { useInfiniteScroll } from "@hooks/ui/useInfiniteScroll";
import { useRenderWindow } from "@hooks/ui/useRenderWindow";
import { announce } from "@utils/announcer";
import { motion, Reorder } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { QUEUE_LOOP_WINDOW_KEY, QUEUE_TRACK_SELECTOR, QUEUE_WINDOW_KEY } from "./constants";
import { mergeReorderedWindow } from "./helpers";
import { movedUpNext, queueMoveDestination } from "./queueMove";
import { QueueRow } from "./QueueRow";
import { queueCaption, queueEmpty, queueList, queueSentinel } from "./styles";
import type { PendingQueueFocus, PlayerQueueBodyProps, PlayerTrack, QueueMoveTarget } from "./types";

export function QueueBody({ view, actions }: PlayerQueueBodyProps) {
  const { t } = useTranslation("player");
  const [scrollRoot, setScrollRoot] = useState<HTMLDivElement | null>(null);
  const pendingFocus = useRef<PendingQueueFocus | null>(null);
  const { playing, upNext, autoplay, loop } = view.queue;
  const window = useRenderWindow(upNext, QUEUE_WINDOW_KEY);
  const loopWindow = useRenderWindow(loop, QUEUE_LOOP_WINDOW_KEY);
  const growing = window.hasMore ? window : loopWindow;
  const order = window.visible.map((entry) => entry.track);
  const sentinelRef = useInfiniteScroll({
    root: scrollRoot,
    hasNextPage: growing.hasMore,
    isFetchingNextPage: false,
    onLoadMore: growing.loadMore,
  });
  const nothingElse = autoplay.length === 0 && loop.length === 0;

  const commit = (tracks: PlayerTrack[]) => {
    actions.reorderQueue([...tracks, ...autoplay.map((entry) => entry.track)]);
  };

  const handleReorder = (next: PlayerTrack[]) => {
    commit(mergeReorderedWindow(next, upNext));
  };

  const handleMove = (from: number, target: QueueMoveTarget) => {
    const destination = queueMoveDestination(target, from, upNext.length);
    const moving = upNext[from];
    if (destination === null || moving === undefined) return;
    pendingFocus.current = { trackId: moving.track.id, fallbackIndex: from };
    commit(movedUpNext(upNext, from, destination));
    announce(t("queueMove.moved", { title: moving.track.title, position: destination + 1, total: upNext.length }));
  };

  useEffect(() => {
    const pending = pendingFocus.current;
    if (pending === null || scrollRoot === null) return;
    pendingFocus.current = null;
    const buttons = Array.from(scrollRoot.querySelectorAll<HTMLElement>(QUEUE_TRACK_SELECTOR));
    const first = playing === null ? 0 : 1;
    const target =
      buttons.find((button) => button.dataset.queueTrack === pending.trackId) ??
      buttons[Math.min(first + pending.fallbackIndex, first + window.visible.length - 1)];
    target?.focus();
  }, [upNext, scrollRoot, playing, window.visible.length]);

  return (
    <motion.div ref={setScrollRoot} layoutScroll className={queueList()}>
      {playing === null ? null : (
        <>
          <span className={queueCaption()}>{t("queue.nowPlaying")}</span>
          <QueueRow entry={playing} current editable={false} actions={actions} />
        </>
      )}
      {upNext.length === 0 && !nothingElse ? null : <span className={queueCaption()}>{t("queue.upNext")}</span>}
      {upNext.length === 0 ? (
        nothingElse ? (
          <span className={queueEmpty()}>{t("queue.empty")}</span>
        ) : null
      ) : (
        <Reorder.Group
          axis="y"
          values={order}
          onReorder={handleReorder}
          as="div"
          role="list"
          aria-label={t("queue.upNext")}
        >
          {window.visible.map((entry, index) => (
            <QueueRow
              key={entry.track.id}
              entry={entry}
              current={false}
              editable={view.queueEditable}
              actions={actions}
              place={{ position: index + 1, total: upNext.length }}
              onMove={(target) => handleMove(index, target)}
            />
          ))}
        </Reorder.Group>
      )}
      {window.hasMore ? <div ref={sentinelRef} className={queueSentinel()} /> : null}
      {autoplay.length === 0 ? null : (
        <>
          <span className={queueCaption()}>{t("queue.autoplay")}</span>
          <div className="contents" role="list" aria-label={t("queue.autoplay")}>
            {autoplay.map((entry, index) => (
              <QueueRow
                key={entry.track.id}
                entry={entry}
                current={false}
                editable={false}
                removable={view.queueEditable}
                actions={actions}
                place={{ position: index + 1, total: autoplay.length }}
              />
            ))}
          </div>
        </>
      )}
      {window.hasMore || loop.length === 0 ? null : (
        <>
          <span className={queueCaption()}>{t("queue.loop")}</span>
          <div className="contents" role="list" aria-label={t("queue.loop")}>
            {loopWindow.visible.map((entry, index) => (
              <QueueRow
                key={entry.track.id}
                entry={entry}
                current={false}
                editable={false}
                removable={view.queueEditable}
                actions={actions}
                place={{ position: index + 1, total: loop.length }}
              />
            ))}
          </div>
          {loopWindow.hasMore ? <div ref={sentinelRef} className={queueSentinel()} /> : null}
        </>
      )}
    </motion.div>
  );
}
