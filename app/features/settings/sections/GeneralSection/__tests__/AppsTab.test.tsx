import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../SubsonicCard", () => ({ SubsonicCard: () => <div data-testid="apps-card">subsonic</div> }));
vi.mock("../McpCard", () => ({ McpCard: () => <div data-testid="apps-card">mcp</div> }));
vi.mock("../ApiKeysCard", () => ({ ApiKeysCard: () => <div data-testid="apps-card">api-keys</div> }));

import { AppsTab } from "../AppsTab";

describe("AppsTab", () => {
  it("renders the music players, assistants and API key cards in order, without a page header of its own", () => {
    render(<AppsTab />);
    expect(screen.getAllByTestId("apps-card").map((card) => card.textContent)).toEqual(["subsonic", "mcp", "api-keys"]);
    expect(screen.queryByRole("heading", { level: 1 })).not.toBeInTheDocument();
  });
});
