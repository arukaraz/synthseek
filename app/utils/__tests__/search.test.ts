import { describe, expect, it } from "vitest";

import { foldText, matchesTerms, searchTerms } from "../search";

describe("foldText", () => {
  it("strips the diacritics a reader does not type", () => {
    expect(foldText("México")).toBe("mexico");
    expect(foldText("Mägo de Oz")).toBe("mago de oz");
    expect(foldText("Beyoncé")).toBe("beyonce");
  });

  it("folds the latin letters that carry no combining mark", () => {
    expect(foldText("Straße")).toBe("strasse");
    expect(foldText("Björk Guðmundsdóttir")).toBe("bjork gudmundsdottir");
    expect(foldText("Mötley Crüe Ø")).toBe("motley crue o");
  });

  it("drops punctuation without gluing separate words together", () => {
    expect(foldText("Don't Stop")).toBe("dont stop");
    expect(foldText("AC/DC")).toBe("acdc");
    expect(foldText("New York, New York")).toBe("new york new york");
  });

  it("keeps the marks of a script whose vowels are marks", () => {
    expect(foldText("हिंदी")).toBe("हिंदी");
    expect(foldText("की")).toBe("की");
  });

  it("collapses whitespace and trims", () => {
    expect(foldText("  Daft   Punk \n")).toBe("daft punk");
  });

  it("keeps folding correctly once the cache has been evicted", () => {
    for (let index = 0; index < 9000; index += 1) foldText(`filler-${index}`);

    expect(foldText("México")).toBe("mexico");
    expect(foldText("Straße")).toBe("strasse");
  });
});

describe("searchTerms", () => {
  it("splits a query into folded terms", () => {
    expect(searchTerms("Daft  Púnk")).toEqual(["daft", "punk"]);
  });

  it("returns no terms for a blank query", () => {
    expect(searchTerms("   ")).toEqual([]);
    expect(searchTerms("")).toEqual([]);
  });
});

describe("matchesTerms", () => {
  it("matches an accented value from an unaccented query", () => {
    expect(matchesTerms(searchTerms("mexico"), ["Ciudad de México"])).toBe(true);
  });

  it("matches an unaccented value from an accented query", () => {
    expect(matchesTerms(searchTerms("México"), ["Ciudad de Mexico"])).toBe(true);
  });

  it("requires every term but ignores their order", () => {
    expect(matchesTerms(searchTerms("punk daft"), ["Daft Punk", "Discovery"])).toBe(true);
    expect(matchesTerms(searchTerms("daft wolfgang"), ["Daft Punk", "Discovery"])).toBe(false);
  });

  it("searches across every field it is given", () => {
    expect(matchesTerms(searchTerms("discovery daft"), ["Discovery", "Daft Punk"])).toBe(true);
  });

  it("ignores empty and missing fields", () => {
    expect(matchesTerms(searchTerms("daft"), [null, undefined, "", "Daft Punk"])).toBe(true);
  });

  it("matches everything when the query carries no terms", () => {
    expect(matchesTerms([], ["anything"])).toBe(true);
  });

  it("does not match a term across a field boundary", () => {
    expect(matchesTerms(searchTerms("punkdiscovery"), ["Daft Punk", "Discovery"])).toBe(false);
  });
});
