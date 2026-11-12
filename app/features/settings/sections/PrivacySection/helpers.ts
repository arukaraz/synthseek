import { HISTORY_RANGE_KEYS } from "./constants";
import type { HistoryRange, LeavingRow, LeavingStatus, ListeningConnectionView, SourceAccountView } from "./types";

function isHistoryRange(value: string): value is HistoryRange {
  return Object.hasOwn(HISTORY_RANGE_KEYS, value);
}

export function historyRanges(): HistoryRange[] {
  return Object.keys(HISTORY_RANGE_KEYS).filter(isHistoryRange);
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
