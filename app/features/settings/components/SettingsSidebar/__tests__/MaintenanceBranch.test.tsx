import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

vi.mock("next/link", () => ({
  default: ({ children, href, ...rest }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

import { MAINTENANCE_BRANCH } from "../constants";
import { MaintenanceBranch } from "../MaintenanceBranch";

const COUNTS = { review: 2, duplicates: 5, recycleBin: 78, quarantine: 0 };

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(cleanup);

function open(pathname = "/settings/general") {
  render(<MaintenanceBranch branch={MAINTENANCE_BRANCH} counts={COUNTS} pathname={pathname} />);
}

function openWhileLoading(pathname: string) {
  render(<MaintenanceBranch branch={MAINTENANCE_BRANCH} counts={undefined} pathname={pathname} />);
}

describe("MaintenanceBranch", () => {
  it("starts collapsed away from maintenance, so the sidebar is not four rows longer for everyone", () => {
    open();

    expect(screen.queryByRole("link", { name: /Review/ })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Maintenance/ })).toHaveAttribute("aria-expanded", "false");
  });

  it("opens itself when the reader is already inside it", () => {
    open("/settings/maintenance/duplicates");

    expect(screen.getByRole("button", { name: /Maintenance/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: /Duplicates/ })).toBeInTheDocument();
  });

  it("shows each surface's count beside it, since that is the reason to look", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: /Maintenance/ }));

    const badges = screen.getAllByRole("link").map((link) => link.textContent);

    expect(badges).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Review2"),
        expect.stringContaining("Duplicates5"),
        expect.stringContaining("Recycle bin78"),
      ])
    );
  });

  it("shows no badge on a surface with nothing in it, rather than a zero", () => {
    open();
    fireEvent.click(screen.getByRole("button", { name: /Maintenance/ }));

    const quarantine = screen.getAllByRole("link").find((link) => link.textContent?.startsWith("Quarantine"));

    expect(quarantine?.textContent).toBe("Quarantine");
  });

  it("shows no badge at all while the counts are still loading", () => {
    openWhileLoading("/settings/maintenance/review");

    const names = screen.getAllByRole("link").map((link) => link.textContent);

    expect(names).toEqual(["Review", "Duplicates", "Recycle bin", "Quarantine"]);
  });

  it("warns on the parent when a child has items waiting, so a collapsed branch still says so", () => {
    open();

    expect(screen.getByText(enSettings.shell.sidebar.maintenanceWaiting)).toBeInTheDocument();
  });

  it("stays quiet on the parent when every child is empty", () => {
    render(
      <MaintenanceBranch
        branch={MAINTENANCE_BRANCH}
        counts={{ review: 0, duplicates: 0, recycleBin: 0, quarantine: 0 }}
        pathname="/settings/general"
      />
    );

    expect(screen.queryByText(enSettings.shell.sidebar.maintenanceWaiting)).not.toBeInTheDocument();
  });

  it("marks the surface the reader is on", () => {
    open("/settings/maintenance/recycle-bin");

    expect(screen.getByRole("link", { name: /Recycle bin/ })).toHaveAttribute(
      "href",
      "/settings/maintenance/recycle-bin"
    );
  });
});
