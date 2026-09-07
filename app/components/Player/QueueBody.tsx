"use client";

import { Reorder } from "framer-motion";
import { useTranslation } from "react-i18next";

import { QueueRow } from "./QueueRow";
import { queueCaption, queueEmpty, queueList } from "./styles";
import type { PlayerQueueBodyProps } from "./types";

export function QueueBody({ view, actions }: PlayerQueueBodyProps) {
  const { t } = useTranslation("player");
  const { playing, upNext } = view.queue;
  const order = upNext.map((entry) => entry.track);

  return (
    <div className={queueList()}>
      {playing === null ? null : (
        <>
          <span className={queueCaption()}>{t("queue.nowPlaying")}</span>
          <QueueRow entry={playing} current editable={false} actions={actions} />
        </>
      )}
      <span className={queueCaption()}>{t("queue.upNext")}</span>
      {upNext.length === 0 ? (
        <span className={queueEmpty()}>{t("queue.empty")}</span>
      ) : (
        <Reorder.Group axis="y" values={order} onReorder={actions.reorderQueue} as="div">
          {upNext.map((entry) => (
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
    </div>
  );
}
