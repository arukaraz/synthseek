import type { BoardSize } from "@hooks/api/queries/board/types";

export type CardSize = "small" | "medium" | "large";

export type MosaicLayout = "pair" | "quad";

export interface CategoriesGridProps {
  size: BoardSize;
  info: string;
}

export interface CategoriesGridSkeletonProps {
  layout: MosaicLayout;
}

export interface GenreItem {
  id: string;
  name: string;
  images?: { url: string }[];
}

export interface CategoryCardProps {
  category: GenreItem;
  size?: CardSize;
  onClick?: (categoryId: string, categoryName: string) => void;
}
