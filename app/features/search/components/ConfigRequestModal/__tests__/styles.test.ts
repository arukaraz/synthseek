import { describe, expect, it } from "vitest";

import {
  acquisitionRadioItem,
  acquisitionTrigger,
  configDialogContent,
  fieldGroup,
  lidarrSelectRadioItem,
  lidarrSelectTrigger,
  lidarrTagChip,
  lidarrTagChipRemove,
  lidarrTagInputField,
  lidarrTagSuggestion,
  lidarrTagsField,
} from "../styles";

describe("configDialogContent", () => {
  it("clamps the modal width on mobile and desktop", () => {
    const result = configDialogContent();
    expect(result).toContain("max-w-[95vw]");
    expect(result).toContain("sm:max-w-lg");
  });
});

describe("fieldGroup", () => {
  it("stacks fields with vertical spacing", () => {
    expect(fieldGroup()).toContain("space-y-3");
  });
});

describe("acquisition controls", () => {
  it("trigger hovers toward the primary token", () => {
    expect(acquisitionTrigger()).toContain("hover:border-primary-500/30");
  });

  it("radio item stacks its label and description", () => {
    expect(acquisitionRadioItem()).toContain("flex-col");
  });
});

describe("lidarr select controls", () => {
  it("trigger disables with reduced opacity", () => {
    expect(lidarrSelectTrigger()).toContain("disabled:opacity-40");
  });

  it("radio item stacks its label and description", () => {
    expect(lidarrSelectRadioItem()).toContain("flex-col");
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
