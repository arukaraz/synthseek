import { DEVICE_CLAIM_CHANNEL, DEVICE_ID_STORAGE_KEY } from "./constants";

export interface DeviceClaim {
  id: string;
  claimedAt: number;
  nonce: string;
}

const BROWSERS: readonly [string, string][] = [
  ["Edg/", "Edge"],
  ["OPR/", "Opera"],
  ["Firefox/", "Firefox"],
  ["Chrome/", "Chrome"],
  ["Safari/", "Safari"],
];

function firstMatch(userAgent: string, table: readonly [string, string][], fallback: string): string {
  for (const [needle, label] of table) {
    if (userAgent.includes(needle)) return label;
  }
  return fallback;
}

export function deviceNameFrom(userAgent: string): string {
  return `Web Player (${firstMatch(userAgent, BROWSERS, "Browser")})`;
}

let identity: { id: string; name: string } | null = null;
let claim: DeviceClaim | null = null;

function mint(name: string): { id: string; name: string } {
  const id = window.crypto.randomUUID();
  window.sessionStorage.setItem(DEVICE_ID_STORAGE_KEY, id);
  return { id, name };
}

export function deviceIdentity(): { id: string; name: string } {
  if (identity !== null) return identity;

  const name = deviceNameFrom(window.navigator.userAgent);
  const stored = window.sessionStorage.getItem(DEVICE_ID_STORAGE_KEY);
  identity = stored !== null && stored.length > 0 ? { id: stored, name } : mint(name);
  claim = { id: identity.id, claimedAt: Date.now(), nonce: window.crypto.randomUUID() };
  return identity;
}

export function shouldYield(mine: DeviceClaim, incoming: DeviceClaim): boolean {
  if (mine.id !== incoming.id) return false;
  if (mine.claimedAt !== incoming.claimedAt) return mine.claimedAt > incoming.claimedAt;
  return mine.nonce > incoming.nonce;
}

export function claimDeviceId(onReplaced: (id: string) => void): () => void {
  if (typeof window.BroadcastChannel !== "function") return () => undefined;

  const channel = new window.BroadcastChannel(DEVICE_CLAIM_CHANNEL);
  const announce = () => {
    if (claim !== null) channel.postMessage(claim);
  };

  channel.onmessage = (event: MessageEvent<DeviceClaim>) => {
    const mine = claim;
    if (mine === null || !shouldYield(mine, event.data)) return;
    const fresh = mint(deviceIdentity().name);
    identity = fresh;
    claim = { id: fresh.id, claimedAt: Date.now(), nonce: window.crypto.randomUUID() };
    announce();
    onReplaced(fresh.id);
  };

  deviceIdentity();
  announce();
  return () => channel.close();
}
