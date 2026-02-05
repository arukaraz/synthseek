"use client";

import { cn } from "@utils/cn";
import { Music } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { categoryPlaceholder } from "../styles";

export type CardSize = "small" | "medium" | "large";

interface CategoryCardProps {
  category: SpotifyApi.CategoryObject;
  size?: CardSize;
  onClick?: (categoryId: string, categoryName: string) => void;
}

const sizeClasses: Record<CardSize, string> = {
  small: "row-span-1",
  medium: "row-span-2",
  large: "row-span-2 sm:col-span-2",
};

export function CategoryCard({ category, size = "small", onClick }: CategoryCardProps) {
  const [imageError, setImageError] = useState(false);

  const handleClick = () => {
    onClick?.(category.id, category.name);
  };

  const categoryImage = category.icons[0]?.url;

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative cursor-pointer overflow-hidden rounded-lg",
        "transition-transform duration-200 hover:-translate-y-0.5",
        "transform-gpu [contain:layout_paint]",
        sizeClasses[size]
      )}
    >
      {categoryImage && !imageError ? (
        <Image
          src={categoryImage}
          alt={category.name}
          fill
          className="object-cover"
          sizes={size === "large" ? "(max-width: 640px) 100vw, 50vw" : "(max-width: 640px) 50vw, 25vw"}
          unoptimized
          onError={() => setImageError(true)}
        />
      ) : (
        <div className={categoryPlaceholder()}>
          <Music className={cn("text-fg/20", size === "large" ? "h-16 w-16" : "h-12 w-12")} />
        </div>
      )}

      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />

      <div className="absolute right-0 bottom-0 left-0 z-10 p-3">
        <h3
          className={cn(
            "text-overlay-fg font-bold",
            size === "large" ? "text-lg sm:text-xl" : size === "medium" ? "text-base" : "text-sm"
          )}
        >
          {category.name}
        </h3>
      </div>

      <div
        className={cn(
          "absolute inset-0 rounded-lg border-2 border-transparent transition-colors duration-200",
          "group-hover:border-primary-500/50"
        )}
      />
    </div>
  );
}
