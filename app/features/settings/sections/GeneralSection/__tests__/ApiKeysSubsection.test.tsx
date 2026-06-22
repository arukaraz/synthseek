import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import {
  createMockQuery,
  createLoadingQuery,
  createErrorQuery,
  createMockMutation,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";
import type { ApiKeySummary } from "../types";

let apiKeysQuery: MockQueryResult<ApiKeySummary[] | undefined> = createMockQuery<ApiKeySummary[] | undefined>([]);

vi.mock("@hooks/api/queries/useApiKeys", () => ({
  useApiKeys: () => apiKeysQuery,
}));

vi.mock("@hooks/api/mutations/api-keys/useRevokeApiKey", () => ({
  useRevokeApiKey: () => createMockMutation(),
}));

vi.mock("@hooks/api/mutations/api-keys/useCreateApiKey", () => ({
  useCreateApiKey: () => createMockMutation(),
}));

import { ApiKeysSubsection } from "../ApiKeysSubsection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  apiKeysQuery = createMockQuery<ApiKeySummary[] | undefined>([]);
});

const key: ApiKeySummary = {
  id: "key-1",
  name: "Claude Desktop",
  last_used_at: null,
  created_at: new Date("2024-01-01T00:00:00Z"),
};

describe("ApiKeysSubsection", () => {
  it("shows the loading state while keys are fetching", () => {
    apiKeysQuery = createLoadingQuery<ApiKeySummary[]>();
    render(<ApiKeysSubsection />);

    expect(screen.getByText(enSettings.api.keys.loading)).toBeInTheDocument();
  });

  it("shows the error message when the query fails", () => {
    apiKeysQuery = createErrorQuery<ApiKeySummary[]>(new Error("offline"));
    render(<ApiKeysSubsection />);

    expect(screen.getByText(/Failed to load keys/i)).toBeInTheDocument();
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it("shows the empty state when there are no keys", () => {
    apiKeysQuery = createMockQuery<ApiKeySummary[]>([]);
    render(<ApiKeysSubsection />);

    expect(screen.getByText(enSettings.api.keys.empty)).toBeInTheDocument();
  });

  it("renders a row per key when the list is populated", () => {
    apiKeysQuery = createMockQuery<ApiKeySummary[]>([key]);
    render(<ApiKeysSubsection />);

    expect(screen.getByText("Claude Desktop")).toBeInTheDocument();
  });

  it("opens the create dialog from the new-key button", async () => {
    apiKeysQuery = createMockQuery<ApiKeySummary[]>([]);
    render(<ApiKeysSubsection />);

    await userEvent.click(screen.getByRole("button", { name: new RegExp(enSettings.api.keys.newKey, "i") }));

    expect(screen.getByText(enSettings.api.create.title)).toBeInTheDocument();
  });
});
