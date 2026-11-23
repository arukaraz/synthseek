import { LOAD_TIMEOUT_MS, MEDIA_ERROR_NAMES, STALL_TIMEOUT_MS } from "./constants";

export function elementStateOf(node: HTMLMediaElement): string {
  return `network state ${node.networkState}, ready state ${node.readyState}`;
}

export function elementErrorCause(node: HTMLMediaElement): string {
  const error = node.error;
  if (!error) return `media error without detail; ${elementStateOf(node)}`;
  const name = MEDIA_ERROR_NAMES[error.code] ?? `code ${error.code}`;
  const message = error.message.length > 0 ? `: ${error.message}` : "";
  return `media error ${error.code} (${name})${message}; ${elementStateOf(node)}`;
}

export function thrownCause(error: unknown): string {
  if (error instanceof Error) return error.message.length > 0 ? `${error.name}: ${error.message}` : error.name;
  return String(error);
}

export function loadTimeoutCause(): string {
  return `no audio within ${LOAD_TIMEOUT_MS / 1000} s`;
}

export function stallCause(): string {
  return `no progress for ${STALL_TIMEOUT_MS / 1000} s`;
}
