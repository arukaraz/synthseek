import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { ContentShell } from "../ContentShell";

vi.mock("@hooks/ui/player", () => ({
  usePlayerDock: () => "hidden",
}));

afterEach(cleanup);

describe("ContentShell", () => {
  it("renders the banner above the page, inside the shell, so the page gives up the banner's height", () => {
    render(
      <ContentShell banner={<p>notice</p>}>
        <p>page</p>
      </ContentShell>
    );

    const banner = screen.getByText("notice");
    const page = screen.getByText("page");

    expect(banner.compareDocumentPosition(page) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(banner.parentElement).toBe(page.parentElement?.parentElement);
  });

  it("renders only the page when no banner is given", () => {
    render(
      <ContentShell>
        <p>page</p>
      </ContentShell>
    );

    expect(screen.getByText("page").parentElement?.previousElementSibling).toBeNull();
  });
});
