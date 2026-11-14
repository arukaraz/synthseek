import { describe, expect, it } from "vitest";

import { cardRowFit, cardRowLimit, isWideSize, listColumns } from "../helpers";

describe("isWideSize", () => {
  it("is true for the three-quarter and full-row sizes only", () => {
    expect(isWideSize("S")).toBe(false);
    expect(isWideSize("M")).toBe(false);
    expect(isWideSize("L")).toBe(true);
    expect(isWideSize("XL")).toBe(true);
  });
});

describe("cardRowLimit", () => {
  it("fits two cards in a quarter or half-width tile, three in a three-quarter one and four in a full-row one", () => {
    expect(cardRowLimit("S")).toBe(2);
    expect(cardRowLimit("M")).toBe(2);
    expect(cardRowLimit("L")).toBe(3);
    expect(cardRowLimit("XL")).toBe(4);
  });
});

describe("listColumns", () => {
  it("splits a list in two columns only across a three-quarter or full row", () => {
    expect(listColumns("S")).toBe("one");
    expect(listColumns("M")).toBe("one");
    expect(listColumns("L")).toBe("two");
    expect(listColumns("XL")).toBe("two");
  });
});

describe("cardRowFit", () => {
  it("counts the cards a row has room for, never fewer than two", () => {
    expect(cardRowFit(0, "XL")).toBe(2);
    expect(cardRowFit(360, "M")).toBe(2);
    expect(cardRowFit(443, "M")).toBe(2);
    expect(cardRowFit(444, "M")).toBe(3);
    expect(cardRowFit(1400, "XL")).toBe(8);
  });

  it("caps a quarter tile at two, a half-width tile at four, a three-quarter tile at six and a full row at the eight the server sends", () => {
    expect(cardRowFit(1400, "S")).toBe(2);
    expect(cardRowFit(1400, "M")).toBe(4);
    expect(cardRowFit(1400, "L")).toBe(6);
    expect(cardRowFit(5000, "XL")).toBe(8);
  });
});
