import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createErrorQuery, createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { QuotaUsageView } from "../../types";

const LIMITED: QuotaUsageView = {
  exempt: false,
  tracks: { limit: 50, used: 12, windowDays: 7 },
  storage: { limitBytes: 10 * 1024 ** 3, storedBytes: 2 * 1024 ** 3, pendingBytes: 1024 ** 3 },
};

let quotaQuery: MockQueryResult<QuotaUsageView | undefined> = createMockQuery<QuotaUsageView | undefined>(LIMITED);

vi.mock("@hooks/api/queries/useMyQuota", () => ({
  useMyQuota: () => quotaQuery,
}));

import { QuotaCard } from "../QuotaCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  quotaQuery = createMockQuery<QuotaUsageView | undefined>(LIMITED);
});

describe("QuotaCard", () => {
  it("shows tracks and storage used against the member's limits", () => {
    render(<QuotaCard />);

    expect(screen.getByText(enSettings.profile.quota.title)).toBeInTheDocument();
    expect(screen.getByText("12 of 50 in the last 7 days")).toBeInTheDocument();
    expect(screen.getByText("3.0 GB of 10.0 GB")).toBeInTheDocument();
    expect(screen.getByText("Includes about 1.0 GB still downloading")).toBeInTheDocument();
  });

  it("tells an exempt role it is not limited instead of listing numbers", () => {
    quotaQuery = createMockQuery<QuotaUsageView | undefined>({ ...LIMITED, exempt: true });
    render(<QuotaCard />);

    expect(screen.getByText(enSettings.profile.quota.exempt)).toBeInTheDocument();
    expect(screen.queryByText(enSettings.profile.quota.tracksLabel)).not.toBeInTheDocument();
    expect(screen.queryByText(enSettings.profile.quota.storageLabel)).not.toBeInTheDocument();
  });

  it("says the quota could not be loaded when the query fails", () => {
    quotaQuery = createErrorQuery<QuotaUsageView | undefined>(new Error("boom"));
    render(<QuotaCard />);

    expect(screen.getByText(enSettings.profile.quota.unavailable)).toBeInTheDocument();
  });
});
