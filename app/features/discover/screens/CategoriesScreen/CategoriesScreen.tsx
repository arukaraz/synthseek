"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategories } from "@hooks/api/queries/useCategories";
import { CategoryCard } from "../../components/CategoriesGrid/CategoryCard";
import { backButton } from "@features/search/components/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";

export function CategoriesScreen() {
  const { t } = useTranslation("discover");
  const router = useRouter();
  const { data, isLoading, isError } = useCategories(50);
  const genres = data?.data?.items ?? [];

  const handleCategoryClick = (categoryId: string, categoryName: string) => {
    router.push(`/discover/category/${categoryId}?name=${encodeURIComponent(categoryName)}`);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-fg/10 shrink-0 border-b">
        <div className="p-4 sm:p-6">
          <button onClick={() => router.back()} className={backButton()}>
            <ArrowLeft className="h-4 w-4" />
            {t("categories.screen.back")}
          </button>
          <h1 className="text-fg text-xl font-bold sm:text-2xl">{t("categories.screen.title")}</h1>
          <p className="text-fg/60 mt-1 text-sm">
            {isLoading ? t("categories.screen.loading") : t("categories.screen.count", { count: genres.length })}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 sm:p-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-fg/5 aspect-square animate-pulse rounded-lg" />
            ))}
          </div>
        ) : isError ? (
          <EmptyState
            icon={AlertCircle}
            title={t("categories.screen.errorTitle")}
            description={t("categories.screen.errorDescription")}
          />
        ) : genres.length === 0 ? (
          <EmptyState
            icon={Grid3X3}
            title={t("categories.screen.emptyTitle")}
            description={t("categories.screen.emptyDescription")}
          />
        ) : (
          <motion.div variants={fadeIn} initial="hidden" animate="visible">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {genres.map((genre) => (
                <div key={genre.id} className="aspect-square">
                  <CategoryCard category={genre} size="small" onClick={handleCategoryClick} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
