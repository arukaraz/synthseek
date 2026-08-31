import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("../JobsCard", () => ({
  JobsCard: () => <div data-testid="jobs-card" />,
}));

vi.mock("../LibraryScanCard", () => ({
  LibraryScanCard: () => <div data-testid="library-scan-card" />,
}));

import { JobsSection } from "../JobsSection";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
});

describe("JobsSection", () => {
  it("renders the page header and the jobs card", () => {
    render(<JobsSection />);
    expect(screen.getByRole("heading", { name: enSettings.jobs.page.title })).toBeInTheDocument();
    expect(screen.getByTestId("jobs-card")).toBeInTheDocument();
    expect(screen.getByTestId("library-scan-card")).toBeInTheDocument();
  });
});
