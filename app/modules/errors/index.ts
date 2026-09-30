export { ErrorBoundaryProvider, useErrorBoundary } from "./ErrorBoundaryProvider";
export { codedErrorOf, extractAppCode, extractAppParams } from "./appCode";
export type { AppErrorCode, CodedError } from "./appCode";
export {
  emitFriendlyToast,
  errorToast,
  errorToastDetailed,
  resolveCodedRefusal,
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
