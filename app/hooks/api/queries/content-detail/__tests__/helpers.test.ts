import { describe, expect, it } from "vitest";

import { DISCOGRAPHY_PENDING_MAX_FETCHES, DISCOGRAPHY_PENDING_REFETCH_MS } from "../constants";
import { discographyRefetchInterval } from "../helpers";

describe("discographyRefetchInterval", () => {
  it("asks again while the server is still sorting the releases into their types", () => {
    expect(discographyRefetchInterval(true, 1)).toBe(DISCOGRAPHY_PENDING_REFETCH_MS);
  });

  it("stops asking once the types are settled", () => {
    expect(discographyRefetchInterval(false, 1)).toBe(false);
  });

  it("stops asking before anything has arrived", () => {
    expect(discographyRefetchInterval(undefined, 0)).toBe(false);
  });

  it("gives up after a bounded number of fetches even if the lookup never finishes", () => {
    expect(discographyRefetchInterval(true, DISCOGRAPHY_PENDING_MAX_FETCHES)).toBe(false);
  });
});
