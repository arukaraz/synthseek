"use client";

import type { RequestListItem } from "@api/__generated__/types";
import { SectionLoading } from "@components/ui/SectionLoading";
import { useRequestList, type RequestListInput } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RequestDetail } from "./RequestDetail/RequestDetail";
import { RequestSidebar } from "./RequestSidebar/RequestSidebar";
import { REQUESTS_URL_PARAMS } from "../types";

export function GroupsViewMode() {
  const { t } = useTranslation("requests");
  const { values, set } = useUrlParams(REQUESTS_URL_PARAMS);
  const sourceLabel = useDownloadSourceLabel();

  const debouncedSearchQuery = useDebounce(values.q, { delay: 300 });
  const sourceKey = values.source === "all" ? null : values.source;
  const listInput: RequestListInput = {
    filter: values.filter,
    source: sourceKey,
    q: debouncedSearchQuery,
    sort: values.sort,
    direction: values.dir,
  };
  const list = useRequestList(listInput);
  const selectedExternalId = values.selected ?? null;
  const loadedSelection = list.items.find((it) => it.external_id === selectedExternalId) ?? null;
  const selectionOutsidePages = selectedExternalId !== null && loadedSelection === null && !list.isLoading;
  const selectionLookup = useRequestList({ ...listInput, externalId: selectedExternalId }, selectionOutsidePages);
  const resolvedSelection = loadedSelection ?? (selectionOutsidePages ? (selectionLookup.items[0] ?? null) : null);
  const awaitingSelection = selectionOutsidePages && selectionLookup.isLoading;
  const [shownSelection, setShownSelection] = useState<RequestListItem | null>(null);
  if (resolvedSelection !== null && resolvedSelection !== shownSelection) setShownSelection(resolvedSelection);
  const keptSelection =
    awaitingSelection && shownSelection !== null && shownSelection.external_id === selectedExternalId
      ? shownSelection
      : null;
  const selected = resolvedSelection ?? keptSelection;
  const emptySourceLabel = sourceKey !== null && values.filter === "all" ? sourceLabel(sourceKey) : null;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (selected !== null || awaitingSelection || list.items.length === 0) return;
    if (!window.matchMedia("(min-width: 768px)").matches) return;
    set("selected", list.items[0].external_id);
  }, [list.items, selected, awaitingSelection, set]);

  const handleSelect = (id: string) => {
    const item = list.items.find((it) => it.id === id);
    if (item) set("selected", item.external_id);
  };

  const handleBack = () => {
    set("selected", null);
  };

  if (list.isLoading) {
    return <SectionLoading message={t("loading.requests")} />;
  }

  return (
    <div className="flex h-full md:flex-row">
      <RequestSidebar
        items={list.items}
        total={list.total}
        selectedId={selected?.id ?? null}
        onSelect={handleSelect}
        searchQuery={debouncedSearchQuery}
        emptySourceLabel={emptySourceLabel}
        filtered={values.filter !== "all" || sourceKey !== null}
        hasNextPage={list.hasNextPage}
        isFetchingNextPage={list.isFetchingNextPage}
        onLoadNext={list.fetchNextPage}
        hasPreviousPage={list.hasPreviousPage}
        isFetchingPreviousPage={list.isFetchingPreviousPage}
        onLoadPrevious={list.fetchPreviousPage}
        className={cn("h-full w-full md:w-72 md:shrink-0", selected ? "hidden md:flex" : "flex")}
      />
      <div className={cn("h-full flex-1 flex-col overflow-hidden", selected ? "flex" : "hidden md:flex")}>
        <RequestDetail request={selected} onBack={handleBack} />
      </div>
    </div>
  );
}
