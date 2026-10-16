import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("../components/ListeningServicesCard", () => ({
  ListeningServicesCard: () => <div data-testid="listening-services-card" />,
}));

import { ListeningSection } from "../ListeningSection";

describe("ListeningSection", () => {
  it("renders the page header and the listening services card", () => {
    render(<ListeningSection />);
    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.listening.title })).toBeInTheDocument();
    expect(screen.getByTestId("listening-services-card")).toBeInTheDocument();
  });
});
