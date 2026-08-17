"use client";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useTrackRequests, useTrackTitleMatches } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { RequestDetail } from "./RequestDetail/RequestDetail";
import { RequestSidebar } from "./RequestSidebar/RequestSidebar";
import { useFilteredRequests } from "../hooks/useFilteredRequests";
import { REQUESTS_URL_PARAMS } from "../types";

export function GroupsViewMode() {
  const { t } = useTranslation("requests");
  const { data: items, isLoading } = useTrackRequests();
  const { values, set } = useUrlParams(REQUESTS_URL_PARAMS);

  const debouncedSearchQuery = useDebounce(values.q, { delay: 300 });
  const { data: trackTitleMatchIds } = useTrackTitleMatches(debouncedSearchQuery);
  const visibleItems = useFilteredRequests(
    items,
    values.filter,
    { field: values.sort, direction: values.dir },
    debouncedSearchQuery,
    trackTitleMatchIds
  );
  const selected = visibleItems.find((it) => it.external_id === values.selected) ?? null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (values.selected || visibleItems.length === 0) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    set("selected", visibleItems[0].external_id);
  }, [visibleItems, values.selected, set]);

  const handleSelect = (id: string) => {
    const item = visibleItems.find((it) => it.id === id);
    if (item) set("selected", item.external_id);
  };

  const handleBack = () => {
    set("selected", null);
  };

  if (isLoading) {
    return <SectionLoading message={t("loading.requests")} />;
  }

  return (
    <div className="flex h-full md:flex-row">
      <RequestSidebar
        items={visibleItems}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        searchQuery={debouncedSearchQuery}
        className={cn("h-full w-full md:w-72 md:shrink-0", selected ? "hidden md:flex" : "flex")}
      />
      <div className={cn("h-full flex-1 flex-col overflow-hidden", selected ? "flex" : "hidden md:flex")}>
        <RequestDetail request={selected} onBack={handleBack} />
      </div>
    </div>
  );
}
