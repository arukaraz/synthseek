"use client";

import { AnimatePresence, motion } from "framer-motion";

import { notificationBadge } from "./styles";
import type { NotificationBadgeProps } from "./types";

export function NotificationBadge({ visible, label, placement = "corner", children }: NotificationBadgeProps) {
  return (
    <AnimatePresence>
      {visible ? (
        <motion.span
          key="notification-badge"
          className={notificationBadge({ placement })}
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <span className="sr-only">{label}</span>
          {children}
        </motion.span>
      ) : null}
    </AnimatePresence>
  );
}
