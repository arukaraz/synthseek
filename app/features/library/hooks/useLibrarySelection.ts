"use client";

import { RequestStatus } from "@api/__generated__/types";
import type { LibraryTrackItem } from "@hooks/api/queries/library/types";
import { useSelection } from "@hooks/ui/useSelection";
import { useMemo } from "react";

export function useLibrarySelection() {
  const selection = useSelection<LibraryTrackItem>();
  const { selectors } = selection;

  const librarySelectors = useMemo(
    () => ({
      ...selectors,
      selectedFailedIds: (items: LibraryTrackItem[]) =>
        selectors.filterSelected(items, (item) => item.status === RequestStatus.enum.failed),
    }),
    [selectors]
  );

  return {
    ...selection,
    selectors: librarySelectors,
  };
}

export type LibrarySelection = ReturnType<typeof useLibrarySelection>;
