import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enHealth from "@modules/i18n/messages/en/health.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";
import type { SlskdCardProps } from "../types";

interface SlskdStatusData {
  status: "healthy" | "unhealthy" | "not_configured";
  message: string;
  messageCode: string;
  messageParams?: Record<string, string>;
}

const updateConnection = createMockMutation();
const updateSearch = createMockMutation();
const updateTimeouts = createMockMutation();
const testConnection = createMockMutation();
let statusQuery: MockQueryResult<SlskdStatusData | undefined> = createMockQuery<SlskdStatusData | undefined>(undefined);

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsSlskd: () => updateConnection,
  useTestSlskd: () => testConnection,
}));

vi.mock("@hooks/api/mutations/settings/useUpdateEngine", () => ({
  useUpdateEngineSearch: () => updateSearch,
  useUpdateEngineTimeouts: () => updateTimeouts,
}));

vi.mock("@hooks/api/queries/useSlskdStatus", () => ({
  useSlskdStatus: () => statusQuery,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { SlskdCard } from "../SlskdCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "health", enHealth, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<SlskdStatusData | undefined>(undefined);
});

const initial: SlskdCardProps["initial"] = {
  connection: { apiUrl: "http://localhost:5030", apiKey: "secret-key", bannedUsers: [] },
  search: {
    maxPeerAttempts: 3,
    maxVariations: 5,
    historyCleanupEnabled: true,
    maxHistorySearches: 20,
    banAfterFailedAttempts: 3,
    strictTierOrdering: false,
  },
  timeouts: {
    searchPhase: 30000,
    downloadPhase: 60000,
    importPhase: 60000,
    peerUnresponsive: 60000,
    queueWaitActivePeer: 300000,
    queueWaitIdlePeer: 600000,
  },
};

describe("SlskdCard", () => {
  it("renders the card title", () => {
    render(<SlskdCard initial={initial} />);
    expect(screen.getByText(enSettings.slskd.title)).toBeInTheDocument();
  });

  it("renders the status badge when status data is present", () => {
    statusQuery = createMockQuery<SlskdStatusData | undefined>({
      status: "healthy",
      message: "Connected",
      messageCode: "SLSKD_CONNECTED",
    });
    render(<SlskdCard initial={initial} />);
    expect(screen.getByText(enSettings.slskd.status.healthy)).toBeInTheDocument();
  });

  it("shows a validation error for a malformed api url", async () => {
    render(<SlskdCard initial={initial} />);

    const input = screen.getByPlaceholderText(enSettings.slskd.apiUrl.placeholder);
    await userEvent.clear(input);
    await userEvent.type(input, "not a url");

    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("runs the connection test and toasts success when it returns ok", async () => {
    testConnection.mutateAsync.mockResolvedValue({ ok: true, message: "All good" });
    render(<SlskdCard initial={initial} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.slskd.testConnection }));

    await waitFor(() => {
      expect(testConnection.mutateAsync).toHaveBeenCalledWith({
        apiUrl: "http://localhost:5030",
        apiKey: "secret-key",
      });
      expect(toast.success).toHaveBeenCalledWith("All good");
    });
  });

  it("toasts an error when the connection test returns not ok", async () => {
    testConnection.mutateAsync.mockResolvedValue({ ok: false, message: "Refused" });
    render(<SlskdCard initial={initial} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.slskd.testConnection }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Refused"));
  });

  it("saves only the dirty search section after toggling a search switch", async () => {
    render(<SlskdCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.search.historyCleanup.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateSearch.mutateAsync).toHaveBeenCalledWith({
        ...initial.search,
        historyCleanupEnabled: false,
      });
      expect(updateTimeouts.mutateAsync).not.toHaveBeenCalled();
      expect(updateConnection.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it("submits the full engine.search group including strictTierOrdering when the tier toggle changes", async () => {
    render(<SlskdCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.search.strictTierOrdering.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateSearch.mutateAsync).toHaveBeenCalledWith({
        ...initial.search,
        strictTierOrdering: true,
      });
      expect(updateTimeouts.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it("saves the timeouts section converting seconds back to milliseconds", async () => {
    render(<SlskdCard initial={initial} />);

    const searchPhase = screen.getByLabelText(enSettings.timeouts.searchPhase.ariaLabel);
    fireEvent.change(searchPhase, { target: { value: "45" } });
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    await waitFor(() => {
      expect(updateTimeouts.mutateAsync).toHaveBeenCalledWith({ ...initial.timeouts, searchPhase: 45000 });
      expect(updateSearch.mutateAsync).not.toHaveBeenCalled();
    });
  });

  it("reverts every section draft when cancel is pressed", async () => {
    render(<SlskdCard initial={initial} />);

    await userEvent.click(screen.getByRole("switch", { name: enSettings.search.historyCleanup.label }));
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });
});
