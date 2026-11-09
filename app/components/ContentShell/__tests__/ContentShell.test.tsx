import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";

import { setChromeCollapsed } from "@hooks/ui/useChromeCollapsed";

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

  it("takes back the header's height on a phone while the header is slid away", () => {
    const { container } = render(
      <ContentShell>
        <p>page</p>
      </ContentShell>
    );
    const shell = container.firstElementChild;
    const reclaimed = "max-sm:h-[calc(100dvh-var(--height-bottom-nav))]";

    expect(shell).not.toHaveClass(reclaimed);
    act(() => setChromeCollapsed(true));
    expect(shell).toHaveClass(reclaimed);
    act(() => setChromeCollapsed(false));
    expect(shell).not.toHaveClass(reclaimed);
  });
});
