import { describe, expect, it } from "vitest";

import {
  configSheet,
  fieldGroup,
  fieldLabel,
  lidarrTagChip,
  lidarrTagChipRemove,
  lidarrTagInputField,
  lidarrTagSuggestion,
  lidarrTagsField,
} from "../styles";

describe("configSheet", () => {
  it("widens the sheet past the narrow default on desktop", () => {
    expect(configSheet()).toContain("sm:max-w-lg");
  });
});

describe("fieldGroup", () => {
  it("stacks fields with vertical spacing", () => {
    expect(fieldGroup()).toContain("space-y-3");
  });
});

describe("fieldLabel", () => {
  it("separates the label from its control with a small bottom margin", () => {
    expect(fieldLabel()).toContain("mb-1.5");
    expect(fieldLabel()).toContain("block");
  });
});

describe("lidarr tag controls", () => {
  it("field shows a focus ring", () => {
    expect(lidarrTagsField()).toContain("focus-within:ring-2");
  });

  it("chip carries the primary accent", () => {
    expect(lidarrTagChip()).toContain("bg-primary-500/15");
  });

  it("chip remove button is a round target", () => {
    expect(lidarrTagChipRemove()).toContain("rounded-full");
  });

  it("input field is transparent", () => {
    expect(lidarrTagInputField()).toContain("bg-transparent");
  });

  it("suggestion highlights on hover", () => {
    expect(lidarrTagSuggestion()).toContain("hover:bg-primary-500/15");
  });
});
