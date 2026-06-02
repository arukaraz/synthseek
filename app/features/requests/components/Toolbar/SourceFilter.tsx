"use client";

import { ContentType } from "@api/__generated__/types";
import {
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@components/ui/DropdownMenu";
import { useTrackRequests } from "@hooks/api";
import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { Disc, ListMusic, Search } from "lucide-react";
import { useState } from "react";
import { deriveSourceOptions, parseSourceIds, serializeSourceIds, toggleSourceId } from "../../helpers";
import { REQUESTS_URL_PARAMS, SOURCE_SEARCH_THRESHOLD } from "../../types";
import { sourceFilterCount, sourceSearchInput } from "./styles";

export function SourceFilter() {
  const { data: items } = useTrackRequests();
  const [raw, setSource] = useUrlParam("source", REQUESTS_URL_PARAMS.source);
  const [query, setQuery] = useState("");

  const selectedIds = parseSourceIds(raw);
  const options = deriveSourceOptions(items);
  const q = query.trim().toLowerCase();
  const filtered = q ? options.filter((option) => option.name.toLowerCase().includes(q)) : options;
  const showSearch = options.length > SOURCE_SEARCH_THRESHOLD;

  const toggle = (id: string) => setSource(serializeSourceIds(toggleSourceId(selectedIds, id)));

  return (
    <>
      <DropdownMenuLabel className="flex items-center gap-2">
        <ListMusic className="size-3" />
        Album / Playlist
        {selectedIds.length > 0 && <span className={sourceFilterCount()}>{selectedIds.length}</span>}
      </DropdownMenuLabel>

      {showSearch && (
        <div className="px-2 pb-1.5" onKeyDown={(event) => event.stopPropagation()}>
          <div className="relative">
            <Search className="text-fg/40 absolute top-1/2 left-2 size-3.5 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search source..."
              className={sourceSearchInput()}
            />
          </div>
        </div>
      )}

      <div className="max-h-56 overflow-y-auto">
        {filtered.map((option) => {
          const isAlbum = option.contentType === ContentType.enum.album;
          const Icon = isAlbum ? Disc : ListMusic;
          return (
            <DropdownMenuCheckboxItem
              key={option.id}
              checked={selectedIds.includes(option.id)}
              onCheckedChange={() => toggle(option.id)}
              onSelect={(event) => event.preventDefault()}
            >
              <Icon className={cn("mr-2 size-3.5 shrink-0", isAlbum ? "type-text-album" : "type-text-playlist")} />
              <span className="min-w-0 flex-1 truncate">{option.name}</span>
            </DropdownMenuCheckboxItem>
          );
        })}
        {filtered.length === 0 && <p className="text-fg/40 px-3 py-2 text-xs">No matches</p>}
      </div>

      {selectedIds.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-fg/50 justify-center text-xs" onSelect={() => setSource(null)}>
            Clear selection
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}
