import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { UpdateCheckResult } from "../types";

type CurrentVersion = { currentVersion: string };

const checkData: UpdateCheckResult = {
  currentVersion: "2.3.0",
  latestVersion: "2.3.0",
  updateAvailable: false,
  checkedAt: new Date("2026-06-22T00:00:00Z"),
};

let currentQuery: MockQueryResult<CurrentVersion | undefined> = createMockQuery<CurrentVersion | undefined>({
  currentVersion: "2.3.0",
});
let checkQuery: MockQueryResult<UpdateCheckResult | undefined> = createMockQuery<UpdateCheckResult | undefined>(
  checkData
);

vi.mock("@hooks/api/queries/useCurrentVersion", () => ({
  useCurrentVersion: () => currentQuery,
}));

vi.mock("@hooks/api/queries/useUpdateCheck", () => ({
  useUpdateCheck: () => checkQuery,
}));

import { UpdatesHeader } from "../UpdatesHeader";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  currentQuery = createMockQuery<CurrentVersion | undefined>({ currentVersion: "2.3.0" });
  checkQuery = createMockQuery<UpdateCheckResult | undefined>(checkData);
});

describe("UpdatesHeader", () => {
  it("renders the page title and a back link to settings", () => {
    render(<UpdatesHeader />);
    expect(screen.getByText(enSettings.updates.page.title)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: enSettings.shell.pageHeader.backToSections })).toHaveAttribute(
      "href",
      "/settings"
    );
  });

  it("renders the current version tag when known", () => {
    render(<UpdatesHeader />);
    expect(screen.getByText("v2.3.0")).toBeInTheDocument();
  });

  it("falls back to a loading label when the version is unknown", () => {
    currentQuery = createMockQuery<CurrentVersion | undefined>(undefined);
    render(<UpdatesHeader />);
    expect(screen.getByText(enSettings.updates.version.loading)).toBeInTheDocument();
  });

  it("omits the checked-at meta when no check has run", () => {
    checkQuery = createMockQuery<UpdateCheckResult | undefined>(undefined);
    render(<UpdatesHeader />);
    expect(screen.queryByText(enSettings.updates.header.currentVersion)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.updates.header.checkNow })).toBeInTheDocument();
  });

  it("triggers a refetch when the check button is pressed", async () => {
    render(<UpdatesHeader />);
    await userEvent.click(screen.getByRole("button", { name: enSettings.updates.header.checkNow }));
    expect(checkQuery.refetch).toHaveBeenCalledTimes(1);
  });

  it("disables the button and shows the checking label while fetching", () => {
    checkQuery = createMockQuery<UpdateCheckResult | undefined>(checkData, { isFetching: true });
    render(<UpdatesHeader />);
    expect(screen.getByRole("button", { name: enSettings.updates.header.checking })).toBeDisabled();
  });
});
