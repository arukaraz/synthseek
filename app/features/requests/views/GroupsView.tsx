"use client";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useTrackRequests } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { useEffect, useState } from "react";
import { RequestDetail } from "../components/RequestDetail/RequestDetail";
import { RequestSidebar } from "../components/RequestSidebar/RequestSidebar";
import { useFilteredRequests } from "../hooks/useFilteredRequests";
import { REQUESTS_URL_PARAMS } from "../types";

export function GroupsView() {
  const { data: items, isLoading } = useTrackRequests();
  const { values, set } = useUrlParams(REQUESTS_URL_PARAMS);

  const debouncedSearchQuery = useDebounce(values.q, { delay: 300 });
  const visibleItems = useFilteredRequests(
    items,
    values.filter,
    { field: values.sort, direction: values.dir },
    debouncedSearchQuery
  );
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (selectedRequestId && !visibleItems.some((it) => it.id === selectedRequestId)) {
      const mq = window.matchMedia("(min-width: 768px)");
      setSelectedRequestId(mq.matches && visibleItems.length > 0 ? visibleItems[0].id : null);
      return;
    }

    if (selectedRequestId === null && visibleItems.length > 0) {
      if (values.selected) {
        const match = visibleItems.find((it) => it.external_id === values.selected);
        if (match) setSelectedRequestId(match.id);
        return;
      }
      const mq = window.matchMedia("(min-width: 768px)");
      if (mq.matches) setSelectedRequestId(visibleItems[0].id);
    }
  }, [visibleItems, selectedRequestId, values.selected]);

  const handleSelect = (id: string) => {
    setSelectedRequestId(id);
    const item = visibleItems.find((it) => it.id === id);
    if (item) set("selected", item.external_id);
  };

  const handleBack = () => {
    setSelectedRequestId(null);
    if (values.selected) set("selected", null);
  };

  if (isLoading) {
    return <SectionLoading message="Loading requests..." />;
  }

  const selected = visibleItems.find((it) => it.id === selectedRequestId) ?? null;

  return (
    <div className="flex h-full md:flex-row">
      <RequestSidebar
        items={visibleItems}
        selectedId={selectedRequestId}
        onSelect={handleSelect}
        searchQuery={debouncedSearchQuery}
        className={cn("h-full w-full md:w-72 md:shrink-0", selectedRequestId ? "hidden md:flex" : "flex")}
      />
      <div className={cn("h-full flex-1 flex-col overflow-hidden", selectedRequestId ? "flex" : "hidden md:flex")}>
        <RequestDetail request={selected} onBack={handleBack} />
      </div>
    </div>
  );
}
