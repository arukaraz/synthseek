import { isTRPCClientError } from "@trpc/client";

export function getHttpStatusFromError(error: unknown): number | undefined {
  if (!isTRPCClientError(error)) return undefined;
  return error.data?.httpStatus;
}

export function isHttpClientError(error: unknown): boolean {
  const status = getHttpStatusFromError(error);
  return status !== undefined && status >= 400 && status < 500;
}
