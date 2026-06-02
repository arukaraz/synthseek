"use client";

import { ContentType } from "@api/__generated__/types";
import { motion, AnimatePresence } from "framer-motion";
import { Disc3, Music } from "lucide-react";
import { loadingSpinner } from "../styles";
import { ContentListItem } from "./ContentListItem";
import { EmptyState } from "@components/ui/EmptyState";
import type { ContentListProps } from "./types";

export function ContentList({ type, items, isLoading, onActionClick, onNavigate }: ContentListProps) {
  const isArtistView = type === ContentType.enum.artist;

  const sectionTitle = isArtistView ? "Albums" : "Tracks";
  const isClickable = isArtistView;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4">
          <div className={loadingSpinner()} />
          <p className="text-fg/50 text-xs">Loading {sectionTitle.toLowerCase()}...</p>
        </div>
      </div>
    );
  }

  if (!items.length) {
    const emptyIcon = isArtistView ? Disc3 : Music;
    return (
      <div className="py-12">
        <EmptyState
          icon={emptyIcon}
          title={`No ${sectionTitle.toLowerCase()} found`}
          description={`This ${type} doesn't have any ${sectionTitle.toLowerCase()} yet.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-fg/10 border-b px-6 pt-6 pb-2">
        <h2 className="text-fg text-lg font-bold">
          {sectionTitle}
          <span className="text-fg/50 ml-2 text-xs font-normal">({items.length})</span>
        </h2>
      </div>

      <div className="px-3 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${type}-list`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-1"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02, duration: 0.2 }}
              >
                <ContentListItem
                  item={item}
                  parentType={type}
                  onActionClick={onActionClick}
                  onNavigate={onNavigate}
                  isClickable={isClickable}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
