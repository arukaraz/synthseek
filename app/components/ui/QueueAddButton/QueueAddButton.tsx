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

  return (
    <button
      type="button"
      className={cn(queueAddButton({ confirmed }), revealOnHover && !confirmed && queueAddReveal(), className)}
      onClick={handleClick}
      disabled={busy}
      aria-label={confirmed ? confirmedLabel : label}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={confirmed ? "confirmed" : "idle"}
          variants={queueAddSwap}
          initial="enter"
          animate="settled"
          exit="leave"
        >
          {confirmed ? <Check className={queueAddGlyph()} /> : <CirclePlus className={queueAddGlyph()} />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
