import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enHealth from "@modules/i18n/messages/en/health.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";
import type { LidarrCardProps } from "../types";

interface LidarrStatusData {
  status: "healthy" | "unhealthy" | "not_configured";
  message: string;
  messageCode: string;
  messageParams?: Record<string, string>;
}

const update = createMockMutation();
const testConnection = createMockMutation();
let statusQuery: MockQueryResult<LidarrStatusData | undefined> = createMockQuery<LidarrStatusData | undefined>(
  undefined
);

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsLidarr: () => update,
  useTestLidarr: () => testConnection,
}));

vi.mock("@hooks/api/queries/useLidarrStatus", () => ({
  useLidarrStatus: () => statusQuery,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { LidarrCard } from "../LidarrCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "health", enHealth, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  statusQuery = createMockQuery<LidarrStatusData | undefined>(undefined);
});

const connected: LidarrCardProps["initial"] = { url: "http://localhost:8686", apiKey: "secret-key" };

describe("LidarrCard", () => {
  it("renders the card title", () => {
    render(<LidarrCard initial={connected} />);
    expect(screen.getByText(enSettings.lidarr.title)).toBeInTheDocument();
  });

  it("renders the status badge when status data is present", () => {
    statusQuery = createMockQuery<LidarrStatusData | undefined>({
      status: "unhealthy",
      message: "Down",
      messageCode: "LIDARR_API_ERROR",
    });
    render(<LidarrCard initial={connected} />);
    expect(screen.getByText(enSettings.lidarr.status.unhealthy)).toBeInTheDocument();
  });

  it("shows a validation error for a malformed url", () => {
    render(<LidarrCard initial={{ url: "not a url", apiKey: "secret-key" }} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("runs the connection test and toasts success when it returns ok", async () => {
    testConnection.mutateAsync.mockResolvedValue({ ok: true, message: "All good" });
    render(<LidarrCard initial={connected} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.lidarr.testConnection }));

    await waitFor(() => {
      expect(testConnection.mutateAsync).toHaveBeenCalledWith({
        url: "http://localhost:8686",
        apiKey: "secret-key",
      });
      expect(toast.success).toHaveBeenCalledWith("All good");
    });
  });

  it("toasts an error when the connection test returns not ok", async () => {
    testConnection.mutateAsync.mockResolvedValue({ ok: false, message: "Bad key" });
    render(<LidarrCard initial={connected} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.lidarr.testConnection }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Bad key"));
  });

  it("disables the test button when the api key is missing", () => {
    render(<LidarrCard initial={{ url: "http://localhost:8686", apiKey: "" }} />);
    expect(screen.getByRole("button", { name: enSettings.lidarr.testConnection })).toBeDisabled();
  });
});
