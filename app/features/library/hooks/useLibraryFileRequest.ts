"use client";

import { useLibraryPaths } from "@hooks/api/queries/useLibraryPaths";
import { useAuthContext } from "@modules/providers/AuthProvider";
import { useCallback, useMemo, useState } from "react";

import type { LibraryFileActions, LibraryFileRequest, LibraryFileTarget } from "../types";

export function useLibraryFileRequest() {
  const { isAdmin } = useAuthContext();
  const paths = useLibraryPaths(isAdmin);
  const [request, setRequest] = useState<LibraryFileRequest | null>(null);

  const canMove = (paths.data?.length ?? 0) > 1;
  const openMove = useCallback((target: LibraryFileTarget) => setRequest({ kind: "move", target }), []);
  const openDelete = useCallback((target: LibraryFileTarget) => setRequest({ kind: "delete", target }), []);
  const close = useCallback(() => setRequest(null), []);

  const actions = useMemo<LibraryFileActions>(
    () => ({ canMove, openMove, openDelete }),
    [canMove, openMove, openDelete]
  );

  return { actions, flowProps: { request, onClose: close } };
}
