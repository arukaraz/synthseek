import { RequestStatus } from "@api/__generated__/types";
import type { TFunction } from "i18next";
import { describe, expect, it } from "vitest";

import type { LibraryFacetValue } from "@hooks/api/queries/library/types";

import { LIBRARY_STATUS_FACET_VALUES } from "../../../constants";
import { staticFacetValues } from "../helpers";

function fakeStatusT(key: string): string {
  return key;
}

const t = fakeStatusT as unknown as TFunction<"status">;

describe("staticFacetValues", () => {
  it("renders every static value in order even when the backend returned none", () => {
    const result = staticFacetValues(LIBRARY_STATUS_FACET_VALUES, [], t);

    expect(result.map((entry) => entry.value)).toEqual([...RequestStatus.options]);
    expect(result.every((entry) => entry.count === 0)).toBe(true);
  });

  it("pulls each count from the backend values and defaults the rest to zero", () => {
    const backend: LibraryFacetValue[] = [
      { value: "complete", label: "Complete", count: 12 },
      { value: "failed", label: "Failed", count: 3 },
    ];

    const result = staticFacetValues(LIBRARY_STATUS_FACET_VALUES, backend, t);
    const byValue = new Map(result.map((entry) => [entry.value, entry.count]));

    expect(byValue.get("complete")).toBe(12);
    expect(byValue.get("failed")).toBe(3);
    expect(byValue.get("queued")).toBe(0);
    expect(byValue.get("pending_download")).toBe(0);
  });

  it("labels each status from the status namespace label key", () => {
    const result = staticFacetValues(LIBRARY_STATUS_FACET_VALUES, [], t);
    const byValue = new Map(result.map((entry) => [entry.value, entry.label]));

    expect(byValue.get("pending_download")).toBe("request.pending_download.label");
    expect(byValue.get("queued")).toBe("request.queued.label");
  });

  it("falls back to a sentence-cased value when the value is not a known status", () => {
    const result = staticFacetValues(["some_unknown_state"], [], t);

    expect(result).toEqual([{ value: "some_unknown_state", label: "Some unknown state", count: 0 }]);
  });
});
