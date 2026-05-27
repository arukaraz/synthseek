"use client";

import { ImagePlaceholder } from "@components/ui/ImagePlaceholder";
import { Music } from "lucide-react";
import Image from "next/image";
import type { TrackTitleCellProps } from "../types";

export function TrackTitleCell({ item }: TrackTitleCellProps) {
  return (
    <div className="flex items-center gap-3">
      {item.parent.album_art ? (
        <Image
          src={item.parent.album_art}
          alt={item.title}
          width={40}
          height={40}
          className="rounded-md object-cover"
        />
      ) : (
        <ImagePlaceholder size="sm" icon={Music} />
      )}
      <div className="min-w-0">
        <p className="text-fg truncate text-sm font-medium">{item.title}</p>
      </div>
    </div>
  );
}
