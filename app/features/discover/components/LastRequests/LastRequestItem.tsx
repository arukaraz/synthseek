"use client";

import { StatusBadge } from "@components/ui/StatusBadge";
import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import type { FlatTrackRow } from "@features/requests/types";
import { listItem } from "../styles";
import { motion } from "framer-motion";
import { Disc } from "lucide-react";
import Image from "next/image";

interface LastRequestItemProps {
  request: FlatTrackRow;
  index: number;
}

export function LastRequestItem({ request, index }: LastRequestItemProps) {
  const parentName = request.parent.name;
  const parentArt = request.parent.album_art;

  return (
    <motion.article
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={listItem()}
    >
      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md">
        {parentArt ? (
          <Image
            src={parentArt}
            alt={`Album art for ${parentName}`}
            fill
            className="object-cover"
            sizes="48px"
            quality={85}
            loading="lazy"
          />
        ) : (
          <ImagePlaceholder size="md" icon={Disc} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-fg line-clamp-1 text-sm font-medium">{request.title}</h4>
        <p className="text-fg/60 line-clamp-1 text-xs">{parentName}</p>
      </div>

      <StatusBadge status={request.status} size="sm" />
    </motion.article>
  );
}
