import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { DetailSyncConfig } from "../DetailSyncConfig";

describe("DetailSyncConfig", () => {
  it("names the sync switch after the row it sits in", () => {
    renderWithProviders(<DetailSyncConfig itemType="playlist" syncEnabled onToggle={vi.fn()} />);

    expect(screen.getByRole("switch", { name: "Keep in sync" })).toBeChecked();
  });
});
