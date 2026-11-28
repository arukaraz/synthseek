import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { ScheduleDayHourPicker } from "../ScheduleDayHourPicker";

describe("ScheduleDayHourPicker", () => {
  it("names the picker panel after what it sets", async () => {
    const user = userEvent.setup();
    render(<ScheduleDayHourPicker value={{ dayOfWeek: 1, hour: 6 }} onChange={vi.fn()} />);

    await user.click(screen.getByRole("button"));

    expect(
      await screen.findByRole("dialog", { name: enLibrary.discoveryIntegrations.schedule.picker })
    ).toBeInTheDocument();
  });
});
