export type ErrorCategory = "spotify" | "generic";

export type ErrorSeverity = "error" | "warning" | "success";

export interface FriendlyError {
  title: string;
  description?: string;
  severity: ErrorSeverity;
  duration?: number;
}

export interface ErrorEntry extends FriendlyError {
  matches?: ReadonlyArray<RegExp>;
}

export interface ResolveErrorOptions {
  category?: ErrorCategory;
  fallback?: { title: string; description?: string };
}

export type ErrorMutationMeta = Record<string, unknown> & {
  errorCategory?: ErrorCategory;
  silent?: boolean;
};

export type ErrorQueryMeta = ErrorMutationMeta;

export interface ErrorBoundaryContextValue {
  notify: (error: unknown, options?: ResolveErrorOptions) => void;
  notifyById: (
    category: ErrorCategory,
    id: string,
    options?: { fallback?: { title: string; description?: string } }
  ) => void;
  notifySuccess: (category: ErrorCategory, id: string) => void;
}

export interface ErrorBoundaryProviderProps {
  children: import("react").ReactNode;
  queryClient: import("@tanstack/react-query").QueryClient;
}
