import { describe, expect, it } from "vitest";

import { clientAddressHeaders, forwardedRequestHeaders } from "../proxy-headers";

describe("forwardedRequestHeaders", () => {
  it("keeps the X-Forwarded-For chain, which the API reads the client address from", () => {
    const forwarded = forwardedRequestHeaders(
      new Headers({ "x-forwarded-for": "203.0.113.9, 198.51.100.7", cookie: "s=1", host: "synthseek.local" })
    );

    expect(forwarded.get("x-forwarded-for")).toBe("203.0.113.9, 198.51.100.7");
    expect(forwarded.get("cookie")).toBe("s=1");
    expect(forwarded.get("host")).toBeNull();
  });
});

describe("clientAddressHeaders", () => {
  it("carries the X-Forwarded-For chain for a handler that builds its own headers", () => {
    expect(clientAddressHeaders(new Headers({ "x-forwarded-for": "198.51.100.7" }))).toEqual({
      "x-forwarded-for": "198.51.100.7",
    });
  });

  it("adds nothing when the request carried no chain", () => {
    expect(clientAddressHeaders(new Headers({ cookie: "s=1" }))).toEqual({});
  });
});
