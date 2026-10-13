import { ContentType } from "@api/__generated__/types";
import { render, screen, userEvent } from "@test/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestListItem } from "../../../__tests__/factories";
import { KeptReleaseNotice } from "../KeptReleaseNotice";

interface KeptEntry {
  id: string;
  source: "usenet" | "torrent";
  releaseTitle: string;
  sizeBytes: number;
  expiresAt: Date;
}

const state = vi.hoisted(() => ({
  kept: [] as KeptEntry[],
  isAdmin: false,
  asked: [] as Array<[string, string]>,
  remove: vi.fn(),
  removePending: false,
}));

vi.mock("@hooks/api/queries/useKeptReleases", () => ({
  useKeptReleases: (id: string, contentType: string) => {
    state.asked.push([id, contentType]);
    return { data: state.kept };
  },
}));

vi.mock("@hooks/api/mutations/settings/useStagedReleases", () => ({
  useRemoveStagedRelease: () => ({ mutate: state.remove, isPending: state.removePending }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: state.isAdmin, currentUser: { id: "user-1" } }),
}));

function entry(overrides: Partial<KeptEntry> = {}): KeptEntry {
  return {
    id: "staged-1",
    source: "torrent",
    releaseTitle: "Artist - Album",
    sizeBytes: 325 * 1024 * 1024,
    expiresAt: new Date(Date.now() + 5 * 60 * 60 * 1000 + 10 * 60 * 1000),
    ...overrides,
  };
}

beforeEach(() => {
  state.kept = [];
  state.isAdmin = false;
  state.asked = [];
  state.remove.mockReset();
  state.removePending = false;
});

describe("KeptReleaseNotice", () => {
  it("says the album is kept on disk, from where, how big, and until when, for the request it is asked about", () => {
    state.kept = [entry()];
    const request = makeRequestListItem({ id: "album-1", contentType: ContentType.enum.album });

    render(<KeptReleaseNotice request={request} />);

    expect(state.asked.at(-1)).toEqual(["album-1", "album"]);
    expect(screen.getByText("Album kept on disk")).toBeInTheDocument();
    expect(screen.getByText("Torrent · 325.0 MB · expires in 5h")).toBeInTheDocument();
    expect(screen.getByText("Retrying a track reuses it.")).toBeInTheDocument();
  });

  it("lets an admin delete it now, and keeps the button away from everyone else", async () => {
    state.kept = [entry()];
    const { rerender } = render(<KeptReleaseNotice request={makeRequestListItem()} />);
    expect(screen.queryByRole("button", { name: "Delete now" })).not.toBeInTheDocument();

    state.isAdmin = true;
    rerender(<KeptReleaseNotice request={makeRequestListItem()} />);
    await userEvent.setup().click(screen.getByRole("button", { name: "Delete now" }));

    expect(state.remove).toHaveBeenCalledWith({ id: "staged-1" });
  });

  it("explains the kept album on click, and tells an admin that deleting it keeps the songs and the request", async () => {
    state.kept = [entry()];
    state.isAdmin = true;
    const user = userEvent.setup();

    render(<KeptReleaseNotice request={makeRequestListItem()} />);
    await user.click(screen.getByRole("button", { name: "What is a kept album?" }));

    expect(await screen.findByText(/Synthseek keeps a copy for a while/)).toBeInTheDocument();
    expect(screen.getByText(/The songs already in your library and this request stay/)).toBeInTheDocument();
  });

  it("explains the kept album to someone who cannot delete it, without mentioning the button", async () => {
    state.kept = [entry()];
    const user = userEvent.setup();

    render(<KeptReleaseNotice request={makeRequestListItem()} />);
    await user.click(screen.getByRole("button", { name: "What is a kept album?" }));

    expect(await screen.findByText(/Synthseek keeps a copy for a while/)).toBeInTheDocument();
    expect(screen.queryByText(/Delete now only removes that copy/)).not.toBeInTheDocument();
  });

  it("disables the button while a delete is on its way", () => {
    state.kept = [entry()];
    state.isAdmin = true;
    state.removePending = true;

    render(<KeptReleaseNotice request={makeRequestListItem()} />);

    expect(screen.getByRole("button", { name: "Delete now" })).toBeDisabled();
  });

  it("renders nothing when the request keeps nothing on disk", () => {
    const { container } = render(<KeptReleaseNotice request={makeRequestListItem()} />);

    expect(container).toBeEmptyDOMElement();
  });
});
