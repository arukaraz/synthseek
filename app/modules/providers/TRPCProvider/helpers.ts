import { isHttpClientError } from "@utils/trpc-error";

export function retryUnlessClientError(failureCount: number, error: unknown): boolean {
  if (isHttpClientError(error)) return false;
  return failureCount < 1;
}
