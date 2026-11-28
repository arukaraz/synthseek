import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import type { FollowedArtist } from "@hooks/api/queries/artist-follow/types";
import { useSelection } from "@hooks/ui/useSelection";

import { FollowingTable } from "../components/FollowingTable";

const { openArtist } = vi.hoisted(() => ({ openArtist: vi.fn() }));

vi.mock("@components/ReleaseActions", () => ({
  ReleaseMoreMenu: () => null,
  useReleaseActions: () => ({ openArtist }),
}));
vi.mock("@hooks/api/mutations/artist-follow/useSetAutoRequest", () => ({
  useSetAutoRequest: () => ({ mutate: vi.fn() }),
}));

const ARTIST: FollowedArtist = {
  catalogArtistId: "ar-13",
  name: "Eminem",
  image: null,
  followedAt: new Date("2026-11-01T00:00:00Z"),
  autoRequest: true,
  latest: null,
  checked: true,
  unresolvable: false,
};

function Harness() {
  const selection = useSelection<{ id: string }>();
  return <FollowingTable items={[ARTIST]} selection={selection} />;
}

describe("FollowingTable", () => {
  it("names every column, the one holding the row menu included", () => {
    render(<Harness />);

    expect(screen.getByRole("columnheader", { name: "Actions" })).toBeInTheDocument();
  });

  it("opens the artist modal when the name is pressed", async () => {
    render(<Harness />);

    await userEvent.click(screen.getByRole("button", { name: "Eminem" }));

    expect(openArtist).toHaveBeenCalledWith({
      catalogArtistId: "ar-13",
      name: "Eminem",
      cover: null,
      autoRequest: true,
    });
  });
});
