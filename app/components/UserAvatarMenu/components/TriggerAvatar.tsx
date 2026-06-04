"use client";

import { Avatar } from "@components/ui/Avatar";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { triggerAvatarWrapper, triggerBadge } from "../styles";
import type { TriggerAvatarProps } from "../types";

export function TriggerAvatar({ username, avatarUrl, updateAvailable }: TriggerAvatarProps) {
  const { t } = useTranslation("components");
  return (
    <span className={triggerAvatarWrapper()}>
      <Avatar size="md" imageUrl={avatarUrl} username={username} />

      <AnimatePresence>
        {updateAvailable ? (
          <motion.span
            key="update-badge"
            className={triggerBadge()}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
          >
            <span className="sr-only">{t("userMenu.updateAvailable")}</span>
            <ArrowUpCircle aria-hidden className="h-3.5 w-3.5" />
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
