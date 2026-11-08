import { describe, expect, it } from "vitest";

import i18n from "@modules/i18n";

import { VIEW_CONFIG } from "../../../constants";
import type { FacetDef } from "../../../types";
import { facetSearchTerm, facetValueLabel } from "../helpers";

const tStatus = i18n.getFixedT("en", "status");

function facet(key: string): FacetDef {
  const def = VIEW_CONFIG.tracks.facets.find((entry) => entry.key === key);
  if (!def) throw new Error(`no ${key} facet`);
  return def;
}

describe("facetValueLabel", () => {
  it("labels a status from the status copy, and sentence-cases one it does not know", () => {
    expect(facetValueLabel(facet("status"), "complete", [], tStatus, "This device")).toBe("Complete");
    expect(facetValueLabel(facet("status"), "half_done", [], tStatus, "This device")).toBe("Half done");
  });

  it("labels the local playback source with the local label and others by key", () => {
    expect(facetValueLabel(facet("source"), "local", [], tStatus, "This device")).toBe("This device");
    expect(facetValueLabel(facet("source"), "elsewhere", [], tStatus, "This device")).toBe("elsewhere");
  });

  it("capitalizes an origin", () => {
    expect(facetValueLabel(facet("origin"), "deezer", [], tStatus, "This device")).toBe("Deezer");
  });

  it("uses the label the server sent for any other facet, or the raw value when it sent none", () => {
    const values = [{ value: "g1", label: "Synthpop", count: 2 }];

    expect(facetValueLabel(facet("genre"), "g1", values, tStatus, "This device")).toBe("Synthpop");
    expect(facetValueLabel(facet("genre"), "g2", values, tStatus, "This device")).toBe("g2");
  });
});

describe("facetSearchTerm", () => {
  const terms = { artist: "abba", genre: "pop", playlist: "mix", owner: "ann" };

  it("reads the term of each searchable facet", () => {
    expect(facetSearchTerm(terms, "artist")).toBe("abba");
    expect(facetSearchTerm(terms, "genre")).toBe("pop");
    expect(facetSearchTerm(terms, "playlist")).toBe("mix");
    expect(facetSearchTerm(terms, "owner")).toBe("ann");
  });

  it("reads an empty term for an unset search or a facet that is not searchable", () => {
    expect(facetSearchTerm({}, "artist")).toBe("");
    expect(facetSearchTerm({}, "owner")).toBe("");
    expect(facetSearchTerm(terms, "year")).toBe("");
    expect(facetSearchTerm(terms, undefined)).toBe("");
  });
});
