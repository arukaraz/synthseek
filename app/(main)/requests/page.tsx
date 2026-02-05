"use client";

import { RequestsView, ViewMode } from "@features/requests";
import { useSearchParams } from "next/navigation";

export default function RequestsPage() {
  const searchParams = useSearchParams();
  const viewMode = (searchParams.get("view") as ViewMode) ?? "compact";

  return <RequestsView viewMode={viewMode} />;
}
