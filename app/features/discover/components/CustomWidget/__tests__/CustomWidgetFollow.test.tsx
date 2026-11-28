import { afterEach, describe, expect, it, vi } from "vitest";

import { TooltipProvider } from "@components/ui/Tooltip";
import type { WidgetBlock, WidgetResult } from "@hooks/api/queries/widgets/types";
import { createFeedAlbumResult, createFeedAlbumRow, createWidget } from "@test/factories";
import { renderWithProviders, screen } from "@test/test-utils";

import { CustomWidget } from "../CustomWidget";

const { dataQuery } = vi.hoisted(() => ({ dataQuery: vi.fn() }));

vi.mock("@hooks/api/queries/widgets/useWidgetData", () => ({
  useWidgetData: (_widget: unknown, _timeZone: string, enabled: boolean) => dataQuery(enabled),
}));
vi.mock("@hooks/api/queries/widgets/useWidgetPreview", () => ({
  useWidgetPreview: () => ({ data: undefined, isLoading: false, isError: false }),
}));
vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: true, currentUser: { role: "admin" } }),
}));
vi.mock("@hooks/ui/useEntityPlayback", () => ({
  useEntityPlayback: () => ({ playEntity: vi.fn(), shuffleEntity: vi.fn(), startRadio: vi.fn() }),
}));
vi.mock("@features/search/components/ContentRequestFlow", () => ({
  useContentRequestFlow: () => ({ openForTarget: vi.fn(), requestResult: vi.fn() }),
}));
vi.mock("@hooks/api/queries/artist-follow/useFollowedTotal", () => ({ useFollowedTotal: () => 0 }));
vi.mock("@components/ReleaseActions", () => ({
  ReleaseMoreMenu: ({ label }: { label: string }) => <button type="button">{label}</button>,
}));
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

function todayDivider(): HTMLElement {
  const item = screen.getByText("Today").closest("li");
  if (item === null) throw new Error("The Today divider is not a list item");
  return item;
}

function follow(state: "announced" | "available" | "in_library", reissue = false) {
  return { catalogArtistId: "ar1", autoRequest: false, state, reissue };
}

function show(block: WidgetBlock, result: WidgetResult, size: "M" | "L" = "L") {
  dataQuery.mockReturnValue({ data: result, isLoading: false, isError: false });
  renderWithProviders(
    <TooltipProvider>
      <CustomWidget widget={createWidget({ view: { block, action: "request" } })} status="ready" size={size} />
    </TooltipProvider>
  );
}

afterEach(() => {
  vi.clearAllMocks();
});

describe("follow rows in a widget", () => {
  it("offers More only on rows that carry follow data", () => {
    show(
      "list",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "f1", name: "Followed One", catalogAlbumId: "dz-1", follow: follow("available") }),
        createFeedAlbumRow({ id: "f2", name: "Plain Two", catalogAlbumId: "dz-2", follow: null }),
      ])
    );

    expect(screen.getByRole("button", { name: "More for Followed One" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "More for Plain Two" })).not.toBeInTheDocument();
  });

  it("offers More on a card only for a followed row too", () => {
    show(
      "cards",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "f1", name: "Followed One", catalogAlbumId: "dz-1", follow: follow("available") }),
        createFeedAlbumRow({ id: "f2", name: "Plain Two", catalogAlbumId: "dz-2", follow: null }),
      ])
    );

    expect(screen.getAllByRole("button", { name: /^More for / })).toHaveLength(1);
  });

  it("names the artist beside the date and swaps the request button for the state when nothing can be requested", () => {
    show(
      "list",
      createFeedAlbumResult([
        createFeedAlbumRow({
          id: "f1",
          name: "Already Here",
          artist: "Ada",
          catalogAlbumId: "dz-1",
          follow: follow("in_library"),
        }),
      ])
    );

    expect(screen.getByText(/^Ada · /)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Request Already Here" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "In library" })).toBeInTheDocument();
  });

  it("keeps the request button for a release that is not in the library yet", () => {
    show(
      "list",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "f1", name: "Missing", catalogAlbumId: "dz-1", follow: follow("available") }),
      ])
    );

    expect(screen.getByRole("button", { name: "Request Missing" })).toBeInTheDocument();
  });

  it("says a followed release is a reissue beside its date, and nothing on one that is not", () => {
    show(
      "list",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "f1", name: "Old Again", artist: "Ada", follow: follow("available", true) }),
        createFeedAlbumRow({ id: "f2", name: "Brand New", artist: "Bo", follow: follow("available") }),
      ])
    );

    expect(screen.getByText(/^Ada · .* · Reissue$/)).toBeInTheDocument();
    expect(screen.getByText(/^Bo · /)).not.toHaveTextContent("Reissue");
  });

  it("keeps releases from both sides of today when the calendar has room for fewer rows than it was sent", () => {
    const upcoming = ["u1", "u2", "u3", "u4", "u5", "u6"].map((id, index) =>
      createFeedAlbumRow({ id, name: `Next ${id}`, releaseDate: `2999-01-0${index + 1}`, follow: follow("announced") })
    );
    const recent = ["r1", "r2", "r3", "r4"].map((id, index) =>
      createFeedAlbumRow({ id, name: `Past ${id}`, releaseDate: `2000-01-0${9 - index}`, follow: follow("available") })
    );

    show("calendar", createFeedAlbumResult([...upcoming, ...recent]), "M");

    expect(todayDivider()).toHaveTextContent("Today");
    expect(screen.getAllByText(/^Next u/).map((node) => node.textContent)).toEqual(["Next u1", "Next u2", "Next u3"]);
    expect(screen.getAllByText(/^Past r/).map((node) => node.textContent)).toEqual(["Past r1", "Past r2", "Past r3"]);
  });

  it("keeps the releases nearest to today whatever order they were sent in", () => {
    const upcoming = ["u1", "u2", "u3", "u4", "u5", "u6"].map((id, index) =>
      createFeedAlbumRow({ id, name: `Next ${id}`, releaseDate: `2999-01-0${index + 1}`, follow: follow("announced") })
    );
    const recent = ["r1", "r2", "r3", "r4"].map((id, index) =>
      createFeedAlbumRow({ id, name: `Past ${id}`, releaseDate: `2000-01-0${9 - index}`, follow: follow("available") })
    );

    show("calendar", createFeedAlbumResult([...recent.reverse(), ...upcoming.reverse()]), "M");

    expect(screen.getAllByText(/^Next u/).map((node) => node.textContent)).toEqual(["Next u1", "Next u2", "Next u3"]);
    expect(screen.getAllByText(/^Past r/).map((node) => node.textContent)).toEqual(["Past r1", "Past r2", "Past r3"]);
    const divider = todayDivider();
    expect(divider.previousElementSibling).toHaveTextContent("Next u3");
    expect(divider.nextElementSibling).toHaveTextContent("Past r1");
  });

  it("draws a Today divider in the calendar only when releases lie on both sides of today", () => {
    show(
      "calendar",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "p", name: "Past", releaseDate: "2000-01-01", follow: follow("in_library") }),
        createFeedAlbumRow({ id: "n", name: "Next", releaseDate: "2999-01-01", follow: follow("announced") }),
      ])
    );

    expect(todayDivider()).toHaveTextContent("Today");
  });

  it("keeps the Today divider inside the list as a plain item, with no role that a list may not hold", () => {
    show(
      "calendar",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "p", name: "Past", releaseDate: "2000-01-01", follow: follow("in_library") }),
        createFeedAlbumRow({ id: "n", name: "Next", releaseDate: "2999-01-01", follow: follow("announced") }),
      ])
    );

    const divider = todayDivider();

    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
    expect(divider).not.toHaveAttribute("role");
    expect(divider.parentElement?.tagName).toBe("UL");
    const list = divider.closest("ul");
    expect(Array.from(list?.children ?? []).every((child) => child.tagName === "LI")).toBe(true);
  });

  it("places the divider between upcoming and past releases when the newest comes first", () => {
    show(
      "calendar",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "n", name: "Next", releaseDate: "2999-01-01", follow: follow("announced") }),
        createFeedAlbumRow({ id: "p", name: "Past", releaseDate: "2000-01-01", follow: follow("in_library") }),
      ])
    );

    const divider = todayDivider();
    expect(divider).toHaveTextContent("Today");
    expect(divider.previousElementSibling).toHaveTextContent("Next");
    expect(divider.nextElementSibling).toHaveTextContent("Past");
  });

  it("splits on what the server says is out, whatever day the browser thinks it is", () => {
    show(
      "calendar",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "n", name: "Next", releaseDate: "2999-01-02", follow: follow("announced") }),
        createFeedAlbumRow({ id: "o", name: "Out", releaseDate: "2999-01-01", follow: follow("available") }),
      ])
    );

    const divider = todayDivider();
    expect(divider.previousElementSibling).toHaveTextContent("Next");
    expect(divider.nextElementSibling).toHaveTextContent("Out");
  });

  it("leaves out the divider when every release is still to come", () => {
    show(
      "calendar",
      createFeedAlbumResult([
        createFeedAlbumRow({ id: "n", name: "Next", releaseDate: "2999-01-01", follow: follow("announced") }),
      ])
    );

    expect(screen.queryByText("Today")).not.toBeInTheDocument();
  });

  it("points an empty follows feed at the Followed artists tab", () => {
    dataQuery.mockReturnValue({
      data: { ...createFeedAlbumResult([]), source: "follows.releases" },
      isLoading: false,
      isError: false,
    });
    renderWithProviders(
      <TooltipProvider>
        <CustomWidget widget={createWidget({ view: { block: "list", action: "request" } })} status="ready" size="L" />
      </TooltipProvider>
    );

    expect(screen.getByText(/Follow artists to see their releases here/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start with your most played" })).toHaveAttribute(
      "href",
      "/settings/releases/following"
    );
  });
});
