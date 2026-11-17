import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@hooks/api/queries/useLibraryScanStatus", () => ({
  useLibraryScanStatus: () => ({ data: { reclaimRunning: false } }),
}));

vi.mock("../MaintenancePage", () => ({
  MaintenancePage: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("../DuplicatesContent", () => ({
  DuplicatesContent: () => <section data-testid="duplicates-list" />,
}));

vi.mock("../DuplicateResolutionRow", () => ({
  DuplicateResolutionRow: () => <section data-testid="duplicates-setting" />,
}));

import { DuplicatesSection } from "../DuplicatesSection";

afterEach(() => {
  cleanup();
});

describe("DuplicatesSection", () => {
  it("puts the setting that decides what is recycled above the list, where a long list cannot push it away", () => {
    render(<DuplicatesSection />);

    const setting = screen.getByTestId("duplicates-setting");
    const list = screen.getByTestId("duplicates-list");
    expect(setting.compareDocumentPosition(list) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
