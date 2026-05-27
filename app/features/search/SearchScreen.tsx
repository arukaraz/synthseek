"use client";

import { ContentRequestFlow } from "./components/ContentRequestFlow/ContentRequestFlow";
import { SearchResultsWidget } from "./components/SearchResultsWidget/SearchResultsWidget";

export function SearchScreen() {
  return (
    <ContentRequestFlow>
      <SearchResultsWidget />
    </ContentRequestFlow>
  );
}
