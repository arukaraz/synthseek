import { toast } from "sonner";
import { z } from "zod";

import i18n from "@locale";
import type { ParseKeys } from "i18next";

import { extractAppCode } from "./appCode";
import { GENERIC_FALLBACK_CODE, spotifyReasonToCode } from "./constants";
import { resolveByCode, resolveByMessage } from "./registry";
import type { ErrorMutationMeta, FriendlyError, ResolveErrorOptions } from "./types";

function extractMessage(input: unknown): string {
  if (typeof input === "string") return input;
  if (input instanceof Error) return input.message;
  if (input && typeof input === "object" && "message" in input) {
    const message = input.message;
    if (typeof message === "string") return message;
  }
  return "";
}

function genericFallback(): FriendlyError {
  return resolveByCode(GENERIC_FALLBACK_CODE);
}

export function resolveFriendlyError(input: unknown, options: ResolveErrorOptions = {}): FriendlyError {
  const appCode = extractAppCode(input);
  if (appCode) return resolveByCode(appCode);

  const message = extractMessage(input);
  const matched = resolveByMessage(message, options.category);
  if (matched) return matched;

  if (options.fallback) {
    return { ...options.fallback, severity: "error" };
  }
  if (message) {
    return { title: message, severity: "error" };
  }
  return genericFallback();
}

export function resolveFriendlyErrorById(
  category: ResolveErrorOptions["category"],
  id: string,
  options: { fallback?: { title: string; description?: string } } = {}
): FriendlyError {
  if (category === "spotify") {
    const code = spotifyReasonToCode(id);
    if (code) return resolveByCode(code);
  }
  if (options.fallback) {
    return { ...options.fallback, severity: "error" };
  }
  return genericFallback();
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

export function errorToast(error: unknown, fallbackKey?: ParseKeys<"mutations">): void {
  const appCode = extractAppCode(error);
  if (appCode) {
    emitFriendlyToast(resolveByCode(appCode));
    return;
  }
  if (fallbackKey) {
    toast.error(i18n.t(`mutations:${fallbackKey}`));
    return;
  }
  emitFriendlyToast(genericFallback());
}

export function errorToastDetailed(error: unknown, fallbackKey: ParseKeys<"mutations">): void {
  const appCode = extractAppCode(error);
  if (appCode) {
    emitFriendlyToast(resolveByCode(appCode));
    return;
  }
  const description = extractMessage(error);
  toast.error(i18n.t(`mutations:${fallbackKey}`), description ? { description } : undefined);
}

const errorMetaSchema = z
  .object({
    errorCategory: z.enum(["spotify", "generic"]).optional(),
    silent: z.boolean().optional(),
  })
  .passthrough();

export function readErrorMeta(meta: unknown): ErrorMutationMeta {
  const parsed = errorMetaSchema.safeParse(meta);
  if (!parsed.success) return {};
  return parsed.data;
}
