"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategories } from "@hooks/api/queries/useCategories";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { CategoriesGridSkeleton } from "./CategoriesGridSkeleton";
import { CategoryCard } from "./CategoryCard";
import { CATEGORIES_LIMIT } from "./constants";
import { getCardSize } from "./helpers";
import { mosaicGrid, panelBody, emptyWrap } from "./styles";

export function CategoriesGrid() {
  const router = useRouter();
  const { data, isLoading, isError } = useCategories(CATEGORIES_LIMIT);
  const categories = data?.data?.items ?? [];

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/discover/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  const handleSeeAll = () => {
    router.push("/discover/categories");
  };

  if (isLoading) {
    return <CategoriesGridSkeleton />;
  }

  if (isError) {
    return (
      <section className={glassPanelCard({ width: "full" })} aria-labelledby="genres-heading">
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className={panelBody()}>
          <WidgetHeader
            icon={Grid3X3}
            title="Genres"
            subtitle="Explore music by category"
            titleId="genres-heading"
            action={{ label: "See all", ariaLabel: "See all genres", onClick: handleSeeAll }}
          />
          <div className={emptyWrap()}>
            <EmptyState
              icon={AlertCircle}
              title="Failed to load genres"
              description="Unable to fetch genres. Please try again later."
            />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return (
      <section className={glassPanelCard({ width: "full" })} aria-labelledby="genres-heading">
        <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />
        <div className={panelBody()}>
          <WidgetHeader
            icon={Grid3X3}
            title="Genres"
            subtitle="Explore music by category"
            titleId="genres-heading"
            action={{ label: "See all", ariaLabel: "See all genres", onClick: handleSeeAll }}
          />
          <div className={emptyWrap()}>
            <EmptyState icon={Grid3X3} title="No Genres" description="No browse categories available at this time." />
          </div>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className={glassPanelCard({ width: "full" })}
      aria-labelledby="genres-heading"
    >
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className={panelBody()}>
        <WidgetHeader
          icon={Grid3X3}
          title="Genres"
          subtitle="Explore music by category"
          titleId="genres-heading"
          action={{ label: "See all", ariaLabel: "See all genres", onClick: handleSeeAll }}
        />

        <div className={mosaicGrid()}>
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
    </motion.section>
  );
}
