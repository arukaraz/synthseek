"use client";

import { Results } from "./Results";
import type { AllResultsProps } from "./types";

export function AllResults({ title, results, totalCount, maxDisplay, onSeeAll, onResultClick }: AllResultsProps) {
  if (results.length === 0) return null;

  return (
    <div>
      <h4 className="text-fg mb-4 text-xl font-bold">{title}</h4>
      <Results results={results.slice(0, maxDisplay)} onResultClick={onResultClick} />
      {totalCount > maxDisplay && (
        <button onClick={onSeeAll} className="text-fg/60 hover:text-fg mt-4 text-sm font-medium transition-colors">
          See all {totalCount} {title.toLowerCase()} →
        </button>
      )}
    </div>
  );
}
