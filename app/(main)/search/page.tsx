"use client";

import ResultsView from "@features/search/views/ResultsView";
import { useSearchParams } from "next/navigation";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const filter = searchParams.get("filter") ?? "all";

  return <ResultsView query={query} initialFilter={filter} />;
}
