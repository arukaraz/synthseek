import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("../components/ConnectedAccountsCard", () => ({
  ConnectedAccountsCard: () => <div data-testid="connected-accounts-card" />,
}));

import { ConnectedAccountsSection } from "../ConnectedAccountsSection";

describe("ConnectedAccountsSection", () => {
  it("renders the page header and the connected accounts card", () => {
    render(<ConnectedAccountsSection />);
    expect(
      screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.connectedAccounts.title })
    ).toBeInTheDocument();
    expect(screen.getByTestId("connected-accounts-card")).toBeInTheDocument();
  });
});
