import { HISTORY_RANGE_KEYS, SESSION_LENGTH_ORDER } from "./constants";
import type {
  HistoryRange,
  LeavingRow,
  LeavingStatus,
  ListeningConnectionView,
  SessionLengthChoice,
  SourceAccountView,
} from "./types";

function isHistoryRange(value: string): value is HistoryRange {
  return Object.hasOwn(HISTORY_RANGE_KEYS, value);
}

export function historyRanges(): HistoryRange[] {
  return Object.keys(HISTORY_RANGE_KEYS).filter(isHistoryRange);
}

export function sessionLengthChoice(minutes: number | null, custom: boolean): SessionLengthChoice {
  if (minutes === null) return "open";
  if (custom) return "custom";
  const preset = SESSION_LENGTH_ORDER.find((choice) => choice === String(minutes));
  return preset ?? "custom";
}

export function minutesOfChoice(choice: SessionLengthChoice): number | null | undefined {
  if (choice === "open") return null;
  if (choice === "custom") return undefined;
  return Number(choice);
}

function statusOf(connected: boolean, enabled: boolean): LeavingStatus {
  if (!connected) return "notConnected";
  return enabled ? "on" : "off";
}

export function leavingRows(
  connections: readonly ListeningConnectionView[],
  accounts: readonly SourceAccountView[]
): LeavingRow[] {
  return [
    ...connections.map((connection) => ({
      kind: "scrobble" as const,
      id: connection.service,
      status: statusOf(connection.connected, connection.scrobbleEnabled),
    })),
    ...accounts.map((account) => ({
      kind: "server" as const,
      id: account.server,
      status: statusOf(account.connected, account.reportEnabled),
    })),
  ];
}
