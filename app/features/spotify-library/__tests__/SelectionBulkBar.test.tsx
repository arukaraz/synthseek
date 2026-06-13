import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { SelectionBulkBar } from "../components/SelectionBulkBar";
import type { SelectionBulkBarProps } from "../components/types";

function renderBar(overrides: Partial<SelectionBulkBarProps> = {}) {
  const props: SelectionBulkBarProps = {
    selectedCount: 2,
    syncState: "off",
    importState: "off",
    hasPlaylists: true,
    isMixedType: false,
    onActivateSync: vi.fn(),
    onActivateImport: vi.fn(),
    onClear: vi.fn(),
    disabled: false,
    ...overrides,
  };
  return { props, ...render(<SelectionBulkBar {...props} />) };
}

describe("SelectionBulkBar", () => {
  it("labels the region with the selected count", () => {
    renderBar({ selectedCount: 3 });
    expect(screen.getByRole("region", { name: /3 selected items/i })).toBeInTheDocument();
  });

  it("exposes the switches with mixed, on and off states", () => {
    const { rerender } = render(
      <SelectionBulkBar
        selectedCount={2}
        syncState="mixed"
        importState="on"
        hasPlaylists
        isMixedType={false}
        onActivateSync={vi.fn()}
        onActivateImport={vi.fn()}
        onClear={vi.fn()}
        disabled={false}
      />
    );

    const syncSwitch = screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.syncAria });
    const importSwitch = screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.importAria });
    expect(syncSwitch).toHaveAttribute("aria-checked", "mixed");
    expect(importSwitch).toHaveAttribute("aria-checked", "true");

    rerender(
      <SelectionBulkBar
        selectedCount={2}
        syncState="off"
        importState="off"
        hasPlaylists
        isMixedType={false}
        onActivateSync={vi.fn()}
        onActivateImport={vi.fn()}
        onClear={vi.fn()}
        disabled={false}
      />
    );
    expect(screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.syncAria })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("activates sync and import on click", () => {
    const { props } = renderBar();
    fireEvent.click(screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.syncAria }));
    fireEvent.click(screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.importAria }));
    expect(props.onActivateSync).toHaveBeenCalledTimes(1);
    expect(props.onActivateImport).toHaveBeenCalledTimes(1);
  });

  it("disables the sync switch with a description when no playlists are selected", () => {
    renderBar({ hasPlaylists: false });
    const syncSwitch = screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.syncAria });
    expect(syncSwitch).toBeDisabled();
    expect(screen.getByText(enLibrary.spotifyLibrary.selection.syncPlaylistsOnly)).toBeInTheDocument();
  });

  it("shows the playlists-only hint for a mixed-type selection", () => {
    renderBar({ hasPlaylists: true, isMixedType: true });
    expect(screen.getByText(enLibrary.spotifyLibrary.selection.playlistsOnlyHint)).toBeInTheDocument();
  });

  it("disables every control while a save is in flight", () => {
    renderBar({ disabled: true });
    expect(screen.getByRole("switch", { name: enLibrary.spotifyLibrary.selection.importAria })).toBeDisabled();
    expect(screen.getByRole("button", { name: enLibrary.spotifyLibrary.selection.clear })).toBeDisabled();
  });
});
