import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enComponents from "@modules/i18n/messages/en/components.json";
import enPlayer from "@modules/i18n/messages/en/player.json";

const picker = vi.hoisted(() => ({ settle: vi.fn() }));

vi.mock("@hooks/ui/player", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@hooks/ui/player")>()),
  settleSourcePick: picker.settle,
}));

import { SourcePickerDialog } from "../SourcePickerDialog";

const REQUEST = {
  id: 1,
  total: 12,
  counts: [
    { key: "local", count: 10 },
    { key: "navidrome", count: 12 },
  ],
};

beforeEach(() => {
  picker.settle.mockClear();
});

describe("choosing where an album plays from", () => {
  it("offers each source with how many of the tracks it holds, the first one chosen and filling on", () => {
    render(<SourcePickerDialog request={REQUEST} />);

    expect(screen.getByRole("radio", { name: /Local/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Navidrome/ })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByText("10 of 12")).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toHaveAttribute("aria-checked", "true");
  });

  it("plays from the source picked, filling the missing tracks from the next one", async () => {
    const user = userEvent.setup();
    render(<SourcePickerDialog request={REQUEST} />);

    await user.click(screen.getByRole("radio", { name: /Navidrome/ }));
    await user.click(screen.getByRole("button", { name: enPlayer.sourcePicker.play }));

    expect(picker.settle.mock.calls[0]).toEqual([{ source: "navidrome", fillFromNext: true }]);
  });

  it("plays only what the source holds once the listener unticks the box", async () => {
    const user = userEvent.setup();
    render(<SourcePickerDialog request={REQUEST} />);

    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: enPlayer.sourcePicker.play }));

    expect(picker.settle.mock.calls[0]).toEqual([{ source: "local", fillFromNext: false }]);
  });

  it("plays nothing when the listener cancels", async () => {
    const user = userEvent.setup();
    render(<SourcePickerDialog request={REQUEST} />);

    await user.click(screen.getByRole("button", { name: enComponents.confirmation.cancel }));

    expect(picker.settle.mock.calls[0]).toEqual([null]);
  });
});
