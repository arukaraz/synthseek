import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { ModalBottombar } from "../ModalBottombar";
import type { DownloadChoice } from "../types";

const bottombar = enLibrary.librarySource.bottombar;

function renderBar(download: DownloadChoice | null, isSaving = false) {
  render(
    <ModalBottombar
      download={download}
      totalRows={3}
      totalTracks={42}
      onSave={vi.fn()}
      onCancel={vi.fn()}
      isSaving={isSaving}
      hasChanges
      onRefresh={vi.fn()}
      isRefreshing={false}
    />
  );
}

describe("ModalBottombar download choice", () => {
  it("offers no download choice for a source that cannot play the tracks itself", () => {
    renderBar(null);

    expect(screen.queryByText(bottombar.downloadMissing)).not.toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
  });

  it("shows the choice on, explains it with the source's name, and reports a change", async () => {
    const onChange = vi.fn();
    renderBar({ enabled: true, onChange, providerName: "Navidrome" });

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();
    expect(screen.getByText(bottombar.downloadMissing).closest("label")).toHaveAttribute(
      "title",
      bottombar.downloadMissingHint.replace("{{provider}}", "Navidrome")
    );

    await userEvent.click(toggle);

    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("locks the choice while the changes are being saved", () => {
    renderBar({ enabled: false, onChange: vi.fn(), providerName: "Jellyfin" }, true);

    expect(screen.getByRole("switch")).toBeDisabled();
    expect(screen.getByRole("switch")).not.toBeChecked();
  });
});
