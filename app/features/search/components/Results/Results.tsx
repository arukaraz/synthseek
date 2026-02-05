"use client";

import { Card } from "./Card";
import { transformResultForDisplay } from "./helpers";
import type { ResultsProps } from "./types";

export function Results({ results, onResultClick }: ResultsProps) {
  return (
    <div className="grid-responsive-results">
      {results.filter(Boolean).map((result) => (
        <Card key={result.id} result={transformResultForDisplay(result)} onResultClick={onResultClick} />
      ))}
    </div>
  );
}
