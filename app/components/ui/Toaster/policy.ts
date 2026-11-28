import { toast, type ExternalToast } from "sonner";

import { resolveToastCallDuration } from "./helpers";
import type { ToastKind, ToastPolicy } from "./types";

type ToastMethod = typeof toast.error;
type CustomMethod = typeof toast.custom;

const DEFAULT_POLICY: ToastPolicy = { choice: "default", mode: false };

let policy: ToastPolicy = DEFAULT_POLICY;
let installed = false;

export function setToastPolicy(next: ToastPolicy): void {
  policy = next;
}

export function withToastPolicy(kind: ToastKind, data: ExternalToast | undefined): ExternalToast | undefined {
  const duration = resolveToastCallDuration({
    ...policy,
    kind,
    hasAction: data?.action !== undefined,
    explicit: data?.duration,
  });
  if (duration === data?.duration) return data;
  return { ...data, duration };
}

function wrapped(method: ToastMethod, kind: ToastKind): ToastMethod {
  return (message, data) => method(message, withToastPolicy(kind, data));
}

function wrappedCustom(method: CustomMethod): CustomMethod {
  return (render, data) => method(render, withToastPolicy("custom", data));
}

export function installToastPolicy(): void {
  if (installed) return;
  installed = true;
  if (typeof toast.success === "function") toast.success = wrapped(toast.success, "success");
  if (typeof toast.info === "function") toast.info = wrapped(toast.info, "info");
  if (typeof toast.warning === "function") toast.warning = wrapped(toast.warning, "warning");
  if (typeof toast.error === "function") toast.error = wrapped(toast.error, "error");
  if (typeof toast.message === "function") toast.message = wrapped(toast.message, "message");
  if (typeof toast.custom === "function") toast.custom = wrappedCustom(toast.custom);
}
