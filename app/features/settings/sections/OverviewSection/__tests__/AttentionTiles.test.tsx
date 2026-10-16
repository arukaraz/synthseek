import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

interface Counts {
  review: number;
  duplicates: number;
  quarantine: number;
}

interface State {
  push: Mock;
  router: { push: Mock };
  counts: Counts | undefined;
  reviewFiles: number | undefined;
  countsEnabled: Mock;
}

const state = vi.hoisted((): State => {
  const push = vi.fn();
  return { push, router: { push }, counts: undefined, reviewFiles: undefined, countsEnabled: vi.fn() };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/overview",
  useRouter: () => state.router,
}));

vi.mock("@hooks/api/queries/useMaintenanceCounts", () => ({
  useMaintenanceCounts: (enabled: boolean) => {
    state.countsEnabled(enabled);
    return { data: state.counts };
  },
}));

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => ({
    data: state.reviewFiles === undefined ? undefined : { inventory: { reviewFiles: state.reviewFiles } },
  }),
}));

import { AttentionTiles } from "../components/AttentionTiles";

const t = i18n.getFixedT("en", "settings");

function tile(
  titleKey:
    | "shell.tabs.maintenance.review"
    | "shell.tabs.maintenance.duplicates"
    | "shell.tabs.maintenance.quarantine"
    | "overview.tiles.filesToReviewTitle"
) {
  const title = screen.getByText(t(titleKey));
  const button = title.closest("button");
  expect(button).not.toBeNull();
  return button ?? title;
}

beforeEach(() => {
  state.push.mockReset();
  state.countsEnabled.mockReset();
  state.counts = { review: 2, duplicates: 1234, quarantine: 0 };
  state.reviewFiles = 7;
});

describe("AttentionTiles", () => {
  it("always asks for the maintenance counts", () => {
    render(<AttentionTiles />);
    expect(state.countsEnabled).toHaveBeenCalledWith(true);
  });

  it("shows each count with its caption", () => {
    render(<AttentionTiles />);
    expect(tile("shell.tabs.maintenance.review")).toHaveTextContent(
      `${t("shell.tabs.maintenance.review")}2${t("overview.tiles.review")}`
    );
    expect(tile("shell.tabs.maintenance.duplicates")).toHaveTextContent(
      `${t("shell.tabs.maintenance.duplicates")}${(1234).toLocaleString()}${t("overview.tiles.duplicates")}`
    );
    expect(tile("shell.tabs.maintenance.quarantine")).toHaveTextContent(
      `${t("shell.tabs.maintenance.quarantine")}0${t("overview.tiles.quarantine")}`
    );
    expect(tile("overview.tiles.filesToReviewTitle")).toHaveTextContent(
      `${t("overview.tiles.filesToReviewTitle")}7${t("overview.tiles.filesToReview")}`
    );
  });

  it("shows zero while the counts are loading", () => {
    state.counts = undefined;
    state.reviewFiles = undefined;
    render(<AttentionTiles />);
    const counts = screen.getAllByRole("button").map((button) => button.children[1]?.textContent);
    expect(counts).toEqual(["0", "0", "0", "0"]);
  });

  it.each([
    ["shell.tabs.maintenance.review", "/settings/maintenance/review"],
    ["shell.tabs.maintenance.duplicates", "/settings/maintenance/duplicates"],
    ["shell.tabs.maintenance.quarantine", "/settings/maintenance/quarantine"],
    ["overview.tiles.filesToReviewTitle", "/settings/library/scan"],
  ] as const)("opens %s at %s", async (titleKey, href) => {
    render(<AttentionTiles />);
    await userEvent.click(tile(titleKey));
    expect(state.push).toHaveBeenCalledWith(href);
  });
});
