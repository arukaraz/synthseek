import { describe, expect, it } from "vitest";

import { deviceNameFrom, shouldYield } from "../device";

describe("deviceNameFrom", () => {
  it("names a Chrome tab on Linux", () => {
    expect(deviceNameFrom("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/141.0 Safari/537.36")).toBe(
      "Chrome on Linux"
    );
  });

  it("prefers Edge over the Chrome string Edge also carries", () => {
    expect(deviceNameFrom("Mozilla/5.0 (Windows NT 10.0) Chrome/141.0 Safari/537.36 Edg/141.0")).toBe(
      "Edge on Windows"
    );
  });

  it("prefers Firefox over the Safari string it does not carry", () => {
    expect(deviceNameFrom("Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15) Firefox/144.0")).toBe("Firefox on Mac");
  });

  it("names Safari on an iPhone rather than calling it Chrome", () => {
    expect(deviceNameFrom("Mozilla/5.0 (iPhone; CPU iPhone OS 18_0) AppleWebKit/605.1 Version/18.0 Safari/604.1")).toBe(
      "Safari on iPhone"
    );
  });

  it("stays readable when it recognises neither half", () => {
    expect(deviceNameFrom("SomeCrawler/1.0")).toBe("Browser on this device");
  });
});

describe("shouldYield", () => {
  const mine = { id: "d1", claimedAt: 1_000, nonce: "aaa" };

  it("ignores a claim for another device", () => {
    expect(shouldYield(mine, { id: "d2", claimedAt: 500, nonce: "bbb" })).toBe(false);
  });

  it("keeps the id when the other tab claimed it later, so the duplicate is the one that moves", () => {
    expect(shouldYield(mine, { id: "d1", claimedAt: 2_000, nonce: "bbb" })).toBe(false);
  });

  it("gives the id up when the other tab held it first", () => {
    expect(shouldYield(mine, { id: "d1", claimedAt: 500, nonce: "bbb" })).toBe(true);
  });

  it("still settles when both tabs claimed it in the same millisecond", () => {
    expect(shouldYield(mine, { id: "d1", claimedAt: 1_000, nonce: "bbb" })).toBe(false);
    expect(shouldYield({ ...mine, nonce: "zzz" }, { id: "d1", claimedAt: 1_000, nonce: "bbb" })).toBe(true);
  });
});
