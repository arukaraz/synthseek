import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DEVICE_CLAIM_CHANNEL, DEVICE_ID_STORAGE_KEY } from "../constants";
import { deviceKindFrom } from "../device";
import type { DeviceClaim } from "../device";

const channels: FakeChannel[] = [];

class FakeChannel {
  readonly posted: DeviceClaim[] = [];
  readonly close = vi.fn();
  onmessage: ((event: MessageEvent<DeviceClaim>) => void) | null = null;

  constructor(readonly name: string) {
    channels.push(this);
  }

  postMessage(claim: DeviceClaim): void {
    this.posted.push(claim);
  }

  receive(claim: DeviceClaim): void {
    this.onmessage?.(new MessageEvent("message", { data: claim }));
  }
}

let minted = 0;

async function freshDevice(): Promise<typeof import("../device")> {
  vi.resetModules();
  return import("../device");
}

beforeEach(() => {
  channels.length = 0;
  minted = 0;
  window.sessionStorage.clear();
  vi.stubGlobal("BroadcastChannel", FakeChannel);
  Object.defineProperty(window, "BroadcastChannel", { value: FakeChannel, configurable: true, writable: true });
  Object.defineProperty(window.crypto, "randomUUID", {
    value: () => {
      minted += 1;
      return `uuid-${minted}`;
    },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("deviceKindFrom", () => {
  it("calls an iPad a tablet rather than a phone, though it carries neither hint alone", () => {
    expect(deviceKindFrom("Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X) Safari/604.1")).toBe("tablet");
  });

  it("calls an Android tablet a tablet, since the tablet hint wins over the mobile one", () => {
    expect(deviceKindFrom("Mozilla/5.0 (Linux; Android 14; Tablet) Chrome/141.0")).toBe("tablet");
  });

  it("calls an Android handset a phone", () => {
    expect(deviceKindFrom("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Chrome/141.0")).toBe("phone");
  });

  it("calls an iPhone a phone", () => {
    expect(deviceKindFrom("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) Safari/604.1")).toBe("phone");
  });

  it("falls back to a computer for a desktop browser", () => {
    expect(deviceKindFrom("Mozilla/5.0 (X11; Linux x86_64) Chrome/141.0")).toBe("computer");
  });
});

describe("deviceIdentity", () => {
  it("mints an id for a tab that has never had one and keeps it for the session", async () => {
    const device = await freshDevice();

    const identity = device.deviceIdentity();

    expect(identity.id).toBe("uuid-1");
    expect(window.sessionStorage.getItem(DEVICE_ID_STORAGE_KEY)).toBe("uuid-1");
  });

  it("reuses the id the tab already holds rather than minting a second one", async () => {
    window.sessionStorage.setItem(DEVICE_ID_STORAGE_KEY, "stored-id");
    const device = await freshDevice();

    expect(device.deviceIdentity().id).toBe("stored-id");
    expect(minted).toBe(1);
  });

  it("mints a fresh id when the stored one is empty", async () => {
    window.sessionStorage.setItem(DEVICE_ID_STORAGE_KEY, "");
    const device = await freshDevice();

    expect(device.deviceIdentity().id).toBe("uuid-1");
  });

  it("answers with the same identity on every later call", async () => {
    const device = await freshDevice();

    const first = device.deviceIdentity();
    const second = device.deviceIdentity();

    expect(second).toBe(first);
    expect(minted).toBe(2);
  });
});

describe("claimDeviceId", () => {
  it("does nothing on a browser without a broadcast channel", async () => {
    Object.defineProperty(window, "BroadcastChannel", { value: undefined, configurable: true, writable: true });
    const device = await freshDevice();

    const release = device.claimDeviceId(vi.fn());
    release();

    expect(channels).toHaveLength(0);
  });

  it("announces its claim so a duplicate tab can hear it", async () => {
    const device = await freshDevice();

    device.claimDeviceId(vi.fn());

    const channel = channels[0];
    expect(channel?.name).toBe(DEVICE_CLAIM_CHANNEL);
    expect(channel?.posted).toHaveLength(1);
    expect(channel?.posted[0]?.id).toBe("uuid-1");
  });

  it("ignores a claim for an id it does not hold", async () => {
    const device = await freshDevice();
    const replaced = vi.fn();
    device.claimDeviceId(replaced);
    const channel = channels[0];

    channel?.receive({ id: "someone-else", claimedAt: 1, nonce: "a" });

    expect(replaced).not.toHaveBeenCalled();
    expect(device.deviceIdentity().id).toBe("uuid-1");
  });

  it("keeps the id when the other tab claimed it later than this one", async () => {
    const device = await freshDevice();
    const replaced = vi.fn();
    device.claimDeviceId(replaced);
    const channel = channels[0];

    channel?.receive({ id: "uuid-1", claimedAt: Date.now() + 10_000, nonce: "zzz" });

    expect(replaced).not.toHaveBeenCalled();
    expect(device.deviceIdentity().id).toBe("uuid-1");
  });

  it("moves to a fresh id when another tab held that id first", async () => {
    const device = await freshDevice();
    const replaced = vi.fn();
    device.claimDeviceId(replaced);
    const channel = channels[0];

    channel?.receive({ id: "uuid-1", claimedAt: Date.now() - 10_000, nonce: "aaa" });

    expect(replaced).toHaveBeenCalledWith("uuid-3");
    expect(device.deviceIdentity().id).toBe("uuid-3");
    expect(window.sessionStorage.getItem(DEVICE_ID_STORAGE_KEY)).toBe("uuid-3");
  });

  it("announces the fresh id too, so the tabs settle rather than trade the id back", async () => {
    const device = await freshDevice();
    device.claimDeviceId(vi.fn());
    const channel = channels[0];

    channel?.receive({ id: "uuid-1", claimedAt: Date.now() - 10_000, nonce: "aaa" });

    expect(channel?.posted).toHaveLength(2);
    expect(channel?.posted[1]?.id).toBe("uuid-3");
  });

  it("closes the channel when the player goes away", async () => {
    const device = await freshDevice();

    const release = device.claimDeviceId(vi.fn());
    release();

    expect(channels[0]?.close).toHaveBeenCalled();
  });
});
