import { useCallback, useState } from "react";

import { cycleSortDirection, type SortState } from "@components/ui/Table";

export function useMemberSort(initial: SortState) {
  const [sort, setSort] = useState<SortState>(initial);

  const onSort = useCallback((field: string) => {
    setSort((prev) => cycleSortDirection(prev, field));
  }, []);

  return { sort, onSort };
}
