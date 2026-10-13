import { render, screen, userEvent, within } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { FilterSortMenu } from "../FilterSortMenu";

const { replace, searchParamsRef } = vi.hoisted(() => ({
  replace: vi.fn(),
  searchParamsRef: { current: new URLSearchParams() },
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/requests",
  useSearchParams: () => searchParamsRef.current,
}));

const availability = vi.hoisted(() => ({
  current: {
    slskd: { enabled: true, allowsSingleTracks: true },
    ytdlp: { enabled: false, allowsSingleTracks: true },
    usenet: { enabled: false, allowsSingleTracks: false },
    archive: { enabled: true, allowsSingleTracks: true },
    soundcloud: { enabled: false, allowsSingleTracks: true },
    subsonic: { enabled: false, allowsSingleTracks: true },
    torrent: { enabled: true, allowsSingleTracks: false },
  },
}));

vi.mock("@hooks/api", () => ({
  useDownloadSourcesAvailability: () => ({ data: availability.current }),
}));

describe("FilterSortMenu", () => {
  beforeEach(() => {
    searchParamsRef.current = new URLSearchParams();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders every status filter and sort option in the dropdown", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("menuitemradio", { name: "Active" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Waiting for Approval" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Failed" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Recent" })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: "Artist" })).toBeInTheDocument();
  });

  it("writes the pending approval status filter to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Waiting for Approval" }));

    expect(replace).toHaveBeenCalledWith("/requests?filter=pending_approval", { scroll: false });
  });

  it("writes the selected status filter to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Failed" }));

    expect(replace).toHaveBeenCalledWith("/requests?filter=failed", { scroll: false });
  });

  it("writes the selected sort field to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Artist" }));

    expect(replace).toHaveBeenCalledWith("/requests?sort=artist", { scroll: false });
  });

  it("writes the ascending sort direction from the order control", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button", { name: "Filter and sort" }));
    await user.click(screen.getByRole("button", { name: "Ascending" }));

    expect(replace).toHaveBeenCalledWith("/requests?dir=asc", { scroll: false });
  });

  it("reflects the active filter coming from the url params in the trigger label", () => {
    searchParamsRef.current = new URLSearchParams({ filter: "active" });
    render(<FilterSortMenu />);

    expect(screen.getByText("Active · Recent")).toBeInTheDocument();
  });

  it("groups the filters under Status and Source, offering only the sources turned on", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));

    const source = screen.getByRole("group", { name: "Source" });
    const names = within(source)
      .getAllByRole("menuitemradio")
      .map((item) => item.textContent);
    expect(names).toEqual(["All", "Slskd", "Internet Archive", "Torrent"]);
    expect(within(source).getByRole("menuitemradio", { name: "All" })).toHaveAttribute("aria-checked", "true");
    expect(
      within(screen.getByRole("group", { name: "Status" })).getByRole("menuitemradio", { name: "Done" })
    ).toBeInTheDocument();
  });

  it("writes the chosen source to the url", async () => {
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByRole("menuitemradio", { name: "Torrent" }));

    expect(replace).toHaveBeenCalledWith("/requests?source=torrent", { scroll: false });
  });

  it("names the chosen source in the trigger label, and keeps it listed after it was turned off", async () => {
    searchParamsRef.current = new URLSearchParams({ filter: "done", source: "usenet" });
    const user = userEvent.setup();
    render(<FilterSortMenu />);

    expect(screen.getByText("Done · Usenet · Recent")).toBeInTheDocument();
    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("menuitemradio", { name: "Usenet" })).toHaveAttribute("aria-checked", "true");
  });
});
