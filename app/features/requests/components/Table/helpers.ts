import type { RequestWithTracks } from "@api/__generated__/types";
import { compareByStatus } from "../../helpers";
import type { FlatTrackRow, TableSortConfig } from "../../types";

export function flattenRequestsToTrackRows(items: RequestWithTracks[]): FlatTrackRow[] {
  return items.flatMap((item) =>
    item.tracks.map((track) => ({
      ...track,
      parent: {
        id: item.id,
        name: item.name,
        artist: item.artist,
        album_art: item.album_art,
        contentType: item.contentType,
        requestedBy: item.requestedBy,
      },
    }))
  );
}

export function searchFlatTrackRows(rows: FlatTrackRow[], query: string): FlatTrackRow[] {
  if (!query.trim()) return rows;
  const q = query.toLowerCase();
  return rows.filter((row) => {
    if (row.title.toLowerCase().includes(q)) return true;
    if (row.artist.toLowerCase().includes(q)) return true;
    if (row.parent.name.toLowerCase().includes(q)) return true;
    return false;
  });
}

export function sortFlatTrackRows(rows: FlatTrackRow[], sort: TableSortConfig): FlatTrackRow[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.field) {
      case "title":
        return direction * a.title.localeCompare(b.title);
      case "status":
        return direction * compareByStatus(a.status, b.status);
      case "artist":
        return direction * a.artist.localeCompare(b.artist);
      case "album":
        return direction * a.parent.name.localeCompare(b.parent.name);
      case "type":
        return direction * a.parent.contentType.localeCompare(b.parent.contentType);
      case "requestedBy":
        return direction * a.parent.requestedBy.username.localeCompare(b.parent.requestedBy.username);
      case "created_at":
        return direction * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "completed_at": {
        const aDate = a.completed_at ? new Date(a.completed_at).getTime() : 0;
        const bDate = b.completed_at ? new Date(b.completed_at).getTime() : 0;
        return direction * (aDate - bDate);
      }
      default:
        return 0;
    }
  });
}
