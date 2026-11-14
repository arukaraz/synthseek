import type { BoardSize } from "@hooks/api/queries/board/types";

export type CardSize = "small" | "medium" | "large";

export interface CategoriesGridProps {
  size: BoardSize;
  info: string;
}

export interface GenreItem {
  id: string;
  name: string;
  images?: { url: string }[];
}

export interface CategoryCardProps {
  category: GenreItem;
  size?: CardSize;
  className?: string;
  onClick?: (categoryId: string, categoryName: string) => void;
}
