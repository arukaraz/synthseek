import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";
import type { ApiKeySummary } from "../types";

const revoke = createMockMutation();

vi.mock("@hooks/api/mutations/api-keys/useRevokeApiKey", () => ({
  useRevokeApiKey: () => revoke,
}));

import { ApiKeyRow } from "../ApiKeyRow";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const usedKey: ApiKeySummary = {
  id: "key-1",
  name: "Claude Desktop",
  last_used_at: new Date("2024-01-01T00:00:00Z"),
  created_at: new Date("2024-01-01T00:00:00Z"),
};

const neverUsedKey: ApiKeySummary = {
  id: "key-2",
  name: "Cursor",
  last_used_at: null,
  created_at: new Date("2024-01-01T00:00:00Z"),
};

describe("ApiKeyRow", () => {
  it("renders the key name and the never-used label when unused", () => {
    render(<ApiKeyRow apiKey={neverUsedKey} />);

    expect(screen.getByText("Cursor")).toBeInTheDocument();
    expect(screen.getByText(enSettings.api.row.neverUsed)).toBeInTheDocument();
  });

  it("shows a last-used label when the key has been used", () => {
    render(<ApiKeyRow apiKey={usedKey} />);

    expect(screen.getByText(/last used/i)).toBeInTheDocument();
  });

  it("opens the confirmation modal and revokes on confirm", async () => {
    render(<ApiKeyRow apiKey={usedKey} />);

    await userEvent.click(screen.getByRole("button", { name: /Revoke Claude Desktop/i }));
    expect(screen.getByText(enSettings.api.revoke.message)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: enSettings.api.revoke.confirm }));

    expect(revoke.mutate).toHaveBeenCalledWith({ id: "key-1" });
  });
});
