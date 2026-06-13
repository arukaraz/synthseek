import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import enLibrary from "@modules/i18n/messages/en/library.json";
import { createMockLibraryItem } from "@test/mocks/feature-hooks.mock";

import { MasterTableRow } from "../components/MasterTableRow";
import type { LibraryItem } from "../types";

function renderRow(item: LibraryItem, overrides: Partial<Parameters<typeof MasterTableRow>[0]> = {}) {
  return render(
    <table>
      <tbody>
        <MasterTableRow
          item={item}
          selected={false}
          focused={false}
          imported={item.imported}
          syncEnabled={item.syncEnabled}
          syncAvailable={item.type === "playlist"}
          onClick={vi.fn()}
          onToggleSelect={vi.fn()}
          onToggleSync={vi.fn()}
          {...overrides}
        />
      </tbody>
    </table>
  );
}

describe("MasterTableRow sync column", () => {
  it("renders the interactive sync chip for a playlist", () => {
    const item = createMockLibraryItem({ id: "p", type: "playlist", imported: true, syncEnabled: true });
    renderRow(item);

    const chip = screen.getByRole("button", { pressed: true });
    expect(chip).toBeInTheDocument();
    expect(within(chip).getByText(enLibrary.spotifyLibrary.row.enabled)).toBeInTheDocument();
  });

  it("renders a non-interactive dash for an album with its accessible label", () => {
    const item = createMockLibraryItem({ id: "a", type: "album", imported: true });
    renderRow(item, { syncAvailable: false });

    expect(screen.queryByRole("button", { pressed: false })).not.toBeInTheDocument();
    const dash = screen.getByLabelText(enLibrary.spotifyLibrary.row.syncUnavailable);
    expect(dash).toHaveTextContent("-");
  });

  it("renders a non-interactive dash for liked songs", () => {
    const item = createMockLibraryItem({ id: "l", type: "liked", imported: true });
    renderRow(item, { syncAvailable: false });

    expect(screen.getByLabelText(enLibrary.spotifyLibrary.row.syncUnavailable)).toBeInTheDocument();
  });
});
