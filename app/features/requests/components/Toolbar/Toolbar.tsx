"use client";

import { useTrackRequests } from "@hooks/api";
import { useDebounce } from "@hooks/ui/useDebounce";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { useEffect, useState } from "react";
import { toolbarContainer } from "../styles";
import { REQUESTS_URL_PARAMS } from "../../types";
import { FilterSortMenu } from "./FilterSortMenu";
import { ImportProviderMenu } from "./ImportProviderMenu";
import { RequestsToolbarMenu } from "./RequestsToolbarMenu";
import { SearchInput } from "./SearchInput/SearchInput";
import { ViewToggle } from "./ViewToggle";

export function Toolbar() {
  const { data: items } = useTrackRequests();
  const [urlSearchQuery, setUrlSearchQuery] = useUrlParam("q", REQUESTS_URL_PARAMS.q);

  const [searchInput, setSearchInput] = useState(urlSearchQuery);
  const debouncedSearchInput = useDebounce(searchInput, { delay: 300 });

  useEffect(() => {
    if (debouncedSearchInput !== urlSearchQuery) {
      setUrlSearchQuery(debouncedSearchInput || null);
    }
  }, [debouncedSearchInput, urlSearchQuery, setUrlSearchQuery]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const hasItems = (items?.length ?? 0) > 0;

  return (
    <div className={toolbarContainer()}>
      <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
        <div className={cn(isSearchOpen && "hidden sm:block")}>
          <ViewToggle />
        </div>

        <div className={cn("bg-fg/10 h-4 w-px", isSearchOpen && "hidden sm:block")} />

        <div className={cn("flex items-center gap-1.5 sm:gap-2", isSearchOpen && "hidden sm:flex")}>
          <FilterSortMenu />
        </div>

        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          isOpen={isSearchOpen}
          onOpenChange={setIsSearchOpen}
        />
      </div>

      <div className={cn("flex shrink-0 items-center gap-1.5 sm:gap-2", isSearchOpen && "hidden sm:flex")}>
        <ImportProviderMenu />
        <RequestsToolbarMenu hasItems={hasItems} />
      </div>
    </div>
  );
}
