import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FakeFollowServer, FakeServerFailure } from "@test/follow-server";

const navigation = vi.hoisted(() => ({ replace: vi.fn<(href: string) => void>() }));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: navigation.replace }),
  usePathname: () => "/settings/releases",
  useSearchParams: () => new URLSearchParams("month=2026-11"),
}));

import { CalendarIndexSection } from "../CalendarIndexSection";

function listOf(total: number) {
  return { items: [], matching: total, total, withAutoRequest: 0, page: 1, pageSize: 50 };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("CalendarIndexSection", () => {
  it("sends a member who follows someone to the calendar tab, keeping the query", async () => {
    const server = new FakeFollowServer().on("artistFollow.list", () => listOf(3));

    render(<CalendarIndexSection />, { wrapper: server.wrapper() });

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/settings/releases/calendar?month=2026-11"));
  });

  it("says the list could not load and loads it again on retry, instead of staying blank", async () => {
    let fail = true;
    const server = new FakeFollowServer().on("artistFollow.list", () => {
      if (fail) throw new FakeServerFailure("boom");
      return listOf(0);
    });
    render(<CalendarIndexSection />, { wrapper: server.wrapper() });

    const alert = await screen.findByRole("alert");
    expect(navigation.replace).not.toHaveBeenCalled();

    fail = false;
    await userEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(navigation.replace).toHaveBeenCalledWith("/settings/releases/following?month=2026-11"));
    expect(alert).not.toBeInTheDocument();
  });
});
