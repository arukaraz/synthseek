import { toast } from "sonner";

import { resolveById, resolveByMessage } from "./registry";
import type { ErrorMutationMeta, FriendlyError, ResolveErrorOptions } from "./types";

const DEFAULT_FALLBACK: FriendlyError = {
  title: "Something went wrong",
  description: "Please try again. If it keeps failing, check the logs.",
  severity: "error",
};

function extractMessage(input: unknown): string {
  if (typeof input === "string") return input;
  if (input instanceof Error) return input.message;
  if (input && typeof input === "object" && "message" in input) {
    const message = (input as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "";
}

export function resolveFriendlyError(input: unknown, options: ResolveErrorOptions = {}): FriendlyError {
  const message = extractMessage(input);
  const matched = resolveByMessage(message, options.category);
  if (matched) return matched;
  if (options.fallback) {
    return { ...DEFAULT_FALLBACK, ...options.fallback, severity: DEFAULT_FALLBACK.severity };
  }
  if (message) {
    return { title: message, severity: "error" };
  }
  return DEFAULT_FALLBACK;
}

export function resolveFriendlyErrorById(
  category: ResolveErrorOptions["category"],
  id: string,
  options: { fallback?: { title: string; description?: string } } = {}
): FriendlyError {
  if (!category) {
    return options.fallback
      ? { ...DEFAULT_FALLBACK, ...options.fallback, severity: DEFAULT_FALLBACK.severity }
      : DEFAULT_FALLBACK;
  }
  const matched = resolveById(category, id);
  if (matched) return matched;
  if (options.fallback) {
    return { ...DEFAULT_FALLBACK, ...options.fallback, severity: DEFAULT_FALLBACK.severity };
  }
  return DEFAULT_FALLBACK;
}

export function emitFriendlyToast(friendly: FriendlyError): void {
  const opts = friendly.description
    ? { description: friendly.description, duration: friendly.duration }
    : friendly.duration
      ? { duration: friendly.duration }
      : undefined;
  if (friendly.severity === "success") toast.success(friendly.title, opts);
  else if (friendly.severity === "warning") toast.warning(friendly.title, opts);
  else toast.error(friendly.title, opts);
}

export function readErrorMeta(meta: unknown): ErrorMutationMeta {
  if (!meta || typeof meta !== "object") return {};
  return meta as ErrorMutationMeta;
}
