/**
 * Correlation ID helper (ported from ../fline/src/utils/api/correlationId.ts).
 *
 * Each browser tab has a single `clientSessionId` (provided by
 * ClientSessionIdProvider). Every mutation attaches a header of the form
 * `${clientSessionId}/${randomUUID()}`. When a subscription event later
 * arrives, future toast-driven handlers can call `isOwnSession` to decide
 * whether the tab originated the event.
 */

export function generateCorrelationId(clientSessionId: string): string {
  return `${clientSessionId}/${crypto.randomUUID()}`;
}

export function isOwnSession(correlationId: string | null | undefined, clientSessionId: string): boolean {
  if (!correlationId) return false;
  const parts = correlationId.split("/");
  return parts.length === 2 && parts[0] === clientSessionId;
}
