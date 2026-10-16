import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

interface PublicConfig {
  publicBaseUrl: string | null;
}

let publicConfigQuery: MockQueryResult<PublicConfig | undefined> = createMockQuery<PublicConfig | undefined>({
  publicBaseUrl: null,
});

vi.mock("@hooks/api/queries/usePublicConfig", () => ({
  usePublicConfig: () => publicConfigQuery,
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));

import { SETTINGS_SEARCH_ENTRIES } from "../../../components/SettingsSearch";
import { McpCard } from "../McpCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  publicConfigQuery = createMockQuery<PublicConfig | undefined>({ publicBaseUrl: null });
});

describe("McpCard", () => {
  it("renders the MCP title and endpoint field", () => {
    render(<McpCard />);

    expect(screen.getByText(enSettings.mcp.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.mcp.endpointLabel)).toBeInTheDocument();
  });

  it("lets the settings search scroll to the card", () => {
    render(<McpCard />);

    const anchor = SETTINGS_SEARCH_ENTRIES.find((entry) => entry.labelKey === "mcp.title")?.anchor;
    expect(anchor).toBeDefined();
    expect(screen.getByText(enSettings.mcp.title).closest("section")).toHaveAttribute("data-anchor-target", anchor);
  });

  it("shows both ways to connect an assistant without expanding anything", () => {
    render(<McpCard />);

    expect(screen.getByText(enSettings.mcp.connectTitle)).toBeInTheDocument();
    expect(screen.getByText(enSettings.mcp.oauthLabel)).toBeInTheDocument();
    expect(screen.getByText(enSettings.mcp.oauthBody)).toBeVisible();
    expect(screen.getByText(enSettings.mcp.keyLabel)).toBeInTheDocument();
    expect(screen.getByText(enSettings.mcp.keyBody)).toBeVisible();
  });

  it("derives the endpoint from the configured public base URL", async () => {
    publicConfigQuery = createMockQuery<PublicConfig>({ publicBaseUrl: "https://music.example.com" });
    render(<McpCard />);

    await waitFor(() => {
      expect(screen.getByDisplayValue("https://music.example.com/api/v1/mcp")).toBeInTheDocument();
    });
  });

  it("copies the endpoint and toasts success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<McpCard />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.mcp.copyEndpointLabel }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
      expect(toastSuccess).toHaveBeenCalledWith(enSettings.mcp.copied);
    });
  });

  it("toasts an error when the clipboard write fails", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<McpCard />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.mcp.copyEndpointLabel }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(enSettings.mcp.copyFailed);
    });
  });

  it("keeps the endpoint read only when a change event reaches the input", async () => {
    publicConfigQuery = createMockQuery<PublicConfig>({ publicBaseUrl: "https://music.example.com" });
    render(<McpCard />);

    const input = await screen.findByDisplayValue("https://music.example.com/api/v1/mcp");
    fireEvent.change(input, { target: { value: "tampered" } });

    expect(screen.getByDisplayValue("https://music.example.com/api/v1/mcp")).toBeInTheDocument();
  });
});
