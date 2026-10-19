import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

vi.mock("../components/OverviewProblems", () => ({ OverviewProblems: () => <div data-testid="problems" /> }));
vi.mock("../components/AttentionTiles", () => ({ AttentionTiles: () => <div data-testid="tiles" /> }));
vi.mock("../components/ConnectionsCard", () => ({ ConnectionsCard: () => <div data-testid="connections" /> }));
vi.mock("../components/SetupChecklistCard", () => ({ SetupChecklistCard: () => <div data-testid="setup" /> }));
vi.mock("../components/JobsGlanceCard", () => ({ JobsGlanceCard: () => <div data-testid="jobs" /> }));
vi.mock("../components/AnalyticsBoard/AnalyticsBoard", () => ({
  AnalyticsBoard: () => <div data-testid="analytics" />,
}));

import { OverviewSection } from "../OverviewSection";

const t = i18n.getFixedT("en", "settings");

describe("OverviewSection", () => {
  it("renders the page header and every overview widget in order", () => {
    render(<OverviewSection />);
    expect(screen.getByRole("heading", { level: 1, name: t("shell.pages.overview.title") })).toBeInTheDocument();
    const order = screen
      .getAllByTestId(/^(problems|tiles|connections|setup|jobs|analytics)$/)
      .map((node) => node.dataset.testid);
    expect(order).toEqual(["problems", "tiles", "connections", "setup", "jobs", "analytics"]);
  });
});
