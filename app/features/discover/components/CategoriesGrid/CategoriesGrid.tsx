"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategories } from "@hooks/api/queries/useCategories";
import { useCountry } from "@modules/providers/CountryProvider";
import { gradientOverlay } from "@theme/utilities/styles";
import { glassPanelCard } from "../styles";
import { fadeIn } from "@utils/animations";
import { cn } from "@utils/cn";
import { motion } from "framer-motion";
import { AlertCircle, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { CategoryCard, type CardSize } from "./CategoryCard";

const CATEGORIES_LIMIT = 8;

const SIZE_PATTERN: CardSize[] = ["medium", "small", "medium", "medium", "small", "small", "medium", "small"];

function getCardSize(index: number): CardSize {
  return SIZE_PATTERN[index] ?? "small";
}

function GenresGridSkeleton() {
  return (
    <div className={glassPanelCard()}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="bg-fg/10 h-5 w-20 animate-pulse rounded" />
            <div className="bg-fg/10 h-3 w-32 animate-pulse rounded" />
          </div>
          <div className="bg-fg/10 h-4 w-14 animate-pulse rounded" />
        </div>
        <div className="grid grid-flow-dense auto-rows-[100px] grid-cols-2 gap-3">
          {SIZE_PATTERN.map((size, i) => (
            <div
              key={i}
              className={cn(
                "bg-fg/5 animate-pulse rounded-lg",
                size === "medium" && "row-span-2",
                size === "small" && "row-span-1"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CategoriesGrid() {
  const router = useRouter();
  const { country } = useCountry();
  const locale = `en_${country}`;
  const { data, isLoading, isError } = useCategories(CATEGORIES_LIMIT, locale);
  const categories = data?.data?.items ?? [];

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/discover/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  const handleSeeAll = () => {
    router.push("/discover/categories");
  };

  if (isLoading) {
    return <GenresGridSkeleton />;
  }

  if (isError) {
    return (
      <div className={glassPanelCard()}>
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className="relative">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load genres"
            description="Unable to fetch categories from Spotify. Please try again later."
          />
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className={glassPanelCard()}>
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className="relative">
          <EmptyState icon={Grid3X3} title="No Genres" description="No browse categories available at this time." />
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={fadeIn} initial="hidden" animate="visible" className={glassPanelCard()}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-fg text-lg font-semibold">Genres</h3>
            <p className="text-fg/60 text-xs">Explore music by category</p>
          </div>
          <button
            onClick={handleSeeAll}
            className="text-primary-400 hover:text-primary-300 text-sm font-medium transition-colors"
          >
            See all
          </button>
        </div>

        <div className="grid grid-flow-dense auto-rows-[100px] grid-cols-2 gap-3">
          {categories.slice(0, CATEGORIES_LIMIT).map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              size={getCardSize(index)}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
