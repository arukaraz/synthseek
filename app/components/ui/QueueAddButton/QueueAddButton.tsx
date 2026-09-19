"use client";

import { cn } from "@utils/cn";
import { AnimatePresence, motion } from "framer-motion";
import { Check, CirclePlus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { QUEUE_ADD_CONFIRM_MS, queueAddSwap } from "./constants";
import { queueAddButton, queueAddGlyph, queueAddReveal } from "./styles";
import type { QueueAddButtonProps } from "./types";

export function QueueAddButton({
  onAdd,
  label,
  confirmedLabel,
  inQueue = false,
  revealOnHover = false,
  className,
}: QueueAddButtonProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const handleClick = useCallback(
    async (event: React.MouseEvent) => {
      event.stopPropagation();
      if (busy) return;
      setBusy(true);
      try {
        const added = await onAdd();
        if (!added) return;
        setConfirmed(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setConfirmed(false), QUEUE_ADD_CONFIRM_MS);
      } finally {
        setBusy(false);
      }
    },
    [busy, onAdd]
  );

  const queued = inQueue || confirmed;

  return (
    <button
      type="button"
      className={cn(queueAddButton({ confirmed: queued }), revealOnHover && !queued && queueAddReveal(), className)}
      onClick={handleClick}
      disabled={busy}
      aria-label={queued ? confirmedLabel : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={queued ? "confirmed" : "idle"}
          variants={queueAddSwap}
          initial="enter"
          animate="settled"
          exit="leave"
        >
          {queued ? <Check className={queueAddGlyph()} /> : <CirclePlus className={queueAddGlyph()} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
