export type CardSize = "small" | "medium" | "large";

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
