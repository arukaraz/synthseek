"use client";

import { NowPlayingBars } from "@components/ui/NowPlayingBars";
import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CircleMinus, CirclePlus } from "lucide-react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { queueAddSwap } from "./constants";
import {
  queueAddButton,
  queueAddGlyph,
  queueAddReveal,
  queueCurrentSlot,
  queueRemoveGlyph,
  queuedGlyph,
} from "./styles";
import type { QueueAddButtonProps } from "./types";

export function QueueAddButton({
  title,
  presence,
  onAdd,
  onRemove,
  revealOnHover = false,
  className,
}: QueueAddButtonProps) {
  const { t } = useTranslation("player");
  const [busy, setBusy] = useState(false);
  const [settling, setSettling] = useState(false);
  const queued = presence === "upcoming";

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (busy || settling) return;
      if (queued) {
        onRemove();
        return;
      }
      setBusy(true);
      setSettling(true);
      let added = false;
      try {
        added = await onAdd();
      } finally {
        setBusy(false);
        if (!added) setSettling(false);
      }
    },
    [busy, onAdd, onRemove, queued, settling]
  );

  const settle = useCallback(() => setSettling(false), []);

  if (presence === "playing" || presence === "paused") {
    return (
      <span className={cn(queueCurrentSlot(), className)}>
        <NowPlayingBars
          playing={presence === "playing"}
          label={t(presence === "playing" ? "queue.playingTrack" : "queue.pausedTrack", { title })}
        />
      </span>
    );
  }

  return (
    <button
      type="button"
      className={cn(queueAddButton({ queued }), revealOnHover && !queued && queueAddReveal(), className)}
      onClick={handleClick}
      onMouseLeave={settle}
      onBlur={settle}
      aria-busy={busy}
      aria-label={t(queued ? "queue.remove" : "queue.addTrack", { title })}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={queued ? "queued" : "idle"}
          variants={queueAddSwap}
          initial="enter"
          animate="settled"
          exit="leave"
        >
          {queued ? (
            <>
              <Check className={queuedGlyph({ settling })} aria-hidden />
              <CircleMinus className={queueRemoveGlyph({ settling })} aria-hidden />
            </>
          ) : (
            <CirclePlus className={queueAddGlyph()} aria-hidden />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
