"use client";

import { createContext, useContext, useEffect, useMemo } from "react";

import { emitFriendlyToast, readErrorMeta, resolveFriendlyError, resolveFriendlyErrorById } from "./helpers";
import type {
  ErrorBoundaryContextValue,
  ErrorBoundaryProviderProps,
  ErrorCategory,
  ErrorMutationMeta,
  ErrorQueryMeta,
} from "./types";

const ErrorBoundaryContext = createContext<ErrorBoundaryContextValue | null>(null);

export function ErrorBoundaryProvider({ children, queryClient }: ErrorBoundaryProviderProps) {
  useEffect(() => {
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "error") return;
      const meta = readErrorMeta(event.query.meta);
      if (meta.silent || !meta.errorCategory) return;
      emitFriendlyToast(resolveFriendlyError(event.action.error, { category: meta.errorCategory }));
    });

    const unsubscribeMutation = queryClient.getMutationCache().subscribe((event) => {
      if (event.type !== "updated" || event.action.type !== "error") return;
      const meta = readErrorMeta(event.mutation?.options.meta);
      if (meta.silent || !meta.errorCategory) return;
      emitFriendlyToast(resolveFriendlyError(event.action.error, { category: meta.errorCategory }));
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, [queryClient]);

  const value = useMemo<ErrorBoundaryContextValue>(
    () => ({
      notify: (error, options) => emitFriendlyToast(resolveFriendlyError(error, options)),
      notifyById: (category, id, options) => emitFriendlyToast(resolveFriendlyErrorById(category, id, options)),
      notifySuccess: (category, id) => emitFriendlyToast(resolveFriendlyErrorById(category, id)),
    }),
    []
  );

  return <ErrorBoundaryContext.Provider value={value}>{children}</ErrorBoundaryContext.Provider>;
}

export function useErrorBoundary(): ErrorBoundaryContextValue {
  const ctx = useContext(ErrorBoundaryContext);
  if (!ctx) throw new Error("useErrorBoundary must be used within ErrorBoundaryProvider");
  return ctx;
}

export type { ErrorCategory, ErrorMutationMeta, ErrorQueryMeta };
