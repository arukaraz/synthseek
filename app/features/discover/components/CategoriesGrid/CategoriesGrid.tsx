"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategories } from "@hooks/api/queries/useCategories";
import { gradientOverlay } from "@theme/utilities/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { AlertCircle, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

import { WidgetHeader } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { CategoriesGridSkeleton } from "./CategoriesGridSkeleton";
import { CategoryCard } from "./CategoryCard";
import { CATEGORIES_LIMIT } from "./constants";
import { getCardSize, mosaicLayoutFor } from "./helpers";
import { emptyWrap, mosaicGrid, panelBody } from "./styles";
import type { CategoriesGridProps } from "./types";

export function CategoriesGrid({ size, info }: CategoriesGridProps) {
  const { t } = useTranslation("discover");
  const router = useRouter();
  const { data, isLoading, isError } = useCategories(CATEGORIES_LIMIT);
  const categories = data?.data?.items ?? [];
  const layout = mosaicLayoutFor(size);

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/discover/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  const handleSeeAll = () => {
    router.push("/discover/categories");
  };

  if (isLoading) {
    return <CategoriesGridSkeleton layout={layout} />;
  }

  const header = (
    <WidgetHeader
      icon={Grid3X3}
      title={t("categories.grid.title")}
      subtitle={t("categories.grid.subtitle")}
      titleId="genres-heading"
      info={info}
      action={{
        label: t("categories.grid.seeAll"),
        ariaLabel: t("categories.grid.seeAllAriaLabel"),
        onClick: handleSeeAll,
      }}
    />
  );

  if (isError || categories.length === 0) {
    return (
      <section className={glassPanelCard({ width: "full" })} aria-labelledby="genres-heading">
        <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />
        <div className={panelBody()}>
          {header}
          <div className={emptyWrap()}>
            {isError ? (
              <EmptyState
                icon={AlertCircle}
                title={t("categories.grid.errorTitle")}
                description={t("categories.grid.errorDescription")}
              />
            ) : (
              <EmptyState
                icon={Grid3X3}
                title={t("categories.grid.emptyTitle")}
                description={t("categories.grid.emptyDescription")}
              />
            )}
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
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className={panelBody()}>
        {header}

        <div className={mosaicGrid({ layout })}>
          {categories.slice(0, CATEGORIES_LIMIT).map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              size={getCardSize(index, layout)}
              onClick={handleCategoryClick}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
