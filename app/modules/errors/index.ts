export { ErrorBoundaryProvider, useErrorBoundary } from "./ErrorBoundaryProvider";
export { extractAppCode } from "./appCode";
export type { AppErrorCode } from "./appCode";
export {
  emitFriendlyToast,
  errorToast,
  errorToastDetailed,
  resolveFriendlyError,
  resolveFriendlyErrorById,
} from "./helpers";
export { resolveByCode, resolveByMessage } from "./registry";
export type {
  ErrorCategory,
  ErrorMutationMeta,
  ErrorQueryMeta,
  ErrorSeverity,
  FriendlyError,
  ResolveErrorOptions,
} from "./types";
