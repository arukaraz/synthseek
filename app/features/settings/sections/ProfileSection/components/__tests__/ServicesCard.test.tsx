import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enComponents from "@modules/i18n/messages/en/components.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("../ConnectedAccountRows", () => ({
  ConnectedAccountRows: () => <div data-testid="services-rows">accounts</div>,
}));

vi.mock("../ListeningServiceRows", () => ({
  ListeningServiceRows: () => <div data-testid="services-rows">listening</div>,
}));

import { ServicesCard } from "../ServicesCard";

describe("ServicesCard", () => {
  it("names the card and lists the account rows before the listening rows", () => {
    render(<ServicesCard />);
    expect(screen.getByRole("heading", { name: new RegExp(enSettings.profile.connected.title) })).toBeInTheDocument();
    expect(screen.getAllByTestId("services-rows").map((rows) => rows.textContent)).toEqual(["accounts", "listening"]);
  });

  it("explains the card behind its info tooltip", async () => {
    render(<ServicesCard />);
    await userEvent.hover(screen.getByRole("button", { name: enComponents.infoTooltip.trigger }));
    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent(enSettings.profile.connected.description);
  });
});
