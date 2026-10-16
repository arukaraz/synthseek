import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("../SubsonicCard", () => ({ SubsonicCard: () => <div data-testid="apps-card">subsonic</div> }));
vi.mock("../McpCard", () => ({ McpCard: () => <div data-testid="apps-card">mcp</div> }));
vi.mock("../ApiKeysCard", () => ({ ApiKeysCard: () => <div data-testid="apps-card">api-keys</div> }));

import { AppsSection } from "../AppsSection";

describe("AppsSection", () => {
  it("renders the page header and the music players, assistants and API key cards in order", () => {
    render(<AppsSection />);
    expect(screen.getByRole("heading", { level: 1, name: enSettings.shell.pages.apps.title })).toBeInTheDocument();
    expect(screen.getAllByTestId("apps-card").map((card) => card.textContent)).toEqual(["subsonic", "mcp", "api-keys"]);
  });
});
