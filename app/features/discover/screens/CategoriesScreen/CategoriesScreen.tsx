"use client";

import { EmptyState } from "@components/ui/EmptyState";
import { useCategories } from "@hooks/api/queries/useCategories";
import { CategoryCard } from "../../components/CategoriesGrid/CategoryCard";
import { backButton } from "@features/search/components/styles";
import { fadeIn } from "@utils/animations";
import { motion } from "framer-motion";
import { ArrowLeft, AlertCircle, Grid3X3 } from "lucide-react";
import { useRouter } from "next/navigation";

export function CategoriesScreen() {
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
            Back
          </button>
          <h1 className="text-fg text-xl font-bold sm:text-2xl">All Genres</h1>
          <p className="text-fg/60 mt-1 text-sm">{isLoading ? "Loading..." : `${genres.length} genres`}</p>
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
          <EmptyState icon={AlertCircle} title="Failed to load genres" description="Please try again later." />
        ) : genres.length === 0 ? (
          <EmptyState icon={Grid3X3} title="No Genres" description="No genres available." />
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
