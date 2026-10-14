import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";
import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { UnidentifiedGroup } from "../types";

interface ListData {
  groups: UnidentifiedGroup[];
  totalGroups: number;
  truncated: boolean;
  counts: { review: number; ignored: number };
}

const state = vi.hoisted(() => ({
  retry: vi.fn(),
  ignore: vi.fn(),
  stopIgnoring: vi.fn(),
  lastInput: null as unknown,
}));

let listQuery: MockQueryResult<ListData | undefined>;

vi.mock("@hooks/api/queries/useUnidentifiedFiles", () => ({
  useUnidentifiedFiles: (input: unknown) => {
    state.lastInput = input;
    return listQuery;
  },
}));

vi.mock("@hooks/api/mutations/library/useUnidentifiedActions", () => ({
  useRetryUnidentified: () => ({ mutate: state.retry, isPending: false }),
  useIgnoreUnidentified: () => ({ mutate: state.ignore, isPending: false }),
  useStopIgnoringUnidentified: () => ({ mutate: state.stopIgnoring, isPending: false }),
}));

vi.mock("@components/ui/Dialog", () => ({
  DialogTitle: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  DialogDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

import { ReviewList } from "../components/ReviewList";

function file(id: string, title: string) {
  return {
    id,
    fileName: `${id}.flac`,
    relativePath: `Folder/${id}.flac`,
    title,
    artist: "The Beatles",
    durationSeconds: 149,
    format: "flac",
    retrying: false,
  };
}

function group(overrides: Partial<UnidentifiedGroup> = {}): UnidentifiedGroup {
  return {
    key: "beatles",
    folder: "The Beatles-Bournemouth 1963",
    album: "Bournemouth 1963",
    artist: "The Beatles",
    discCount: 2,
    fileCount: 2,
    retrying: 0,
    ignoredAt: null,
    files: [file("a", "Roll Over Beethoven"), file("b", "Chains")],
    ...overrides,
  };
}

function listOf(
  groups: UnidentifiedGroup[],
  counts = { review: 2, ignored: 0 },
  truncated = false
): MockQueryResult<ListData | undefined> {
  return createMockQuery<ListData | undefined>({ groups, totalGroups: groups.length, truncated, counts });
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ReviewList", () => {
  it("lists a release once, with how many files and discs it holds", () => {
    listQuery = listOf([group()]);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.getByText("The Beatles · Bournemouth 1963")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /2 files/ })).toBeInTheDocument();
    expect(screen.getByText("2 discs")).toBeInTheDocument();
  });

  it("opens a group's files from the chevron beside the count", () => {
    listQuery = listOf([group()]);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /2 files/ }));

    expect(screen.getByText("Roll Over Beethoven")).toBeInTheDocument();
    expect(screen.getByText("Chains")).toBeInTheDocument();
  });

  it("matches a release to an album, and a single file to a song", () => {
    const single = group({ key: "trapt", fileCount: 1, discCount: 1, files: [file("t", "Panic Room")] });
    listQuery = listOf([group(), single]);
    const onMatchAlbum = vi.fn();
    const onMatchSong = vi.fn();

    render(<ReviewList enabled active onMatchAlbum={onMatchAlbum} onMatchSong={onMatchSong} />);
    fireEvent.click(screen.getByRole("button", { name: /Match to an album/ }));
    fireEvent.click(screen.getByRole("button", { name: /Match to a song/ }));

    expect(onMatchAlbum).toHaveBeenCalledWith(expect.objectContaining({ key: "beatles" }));
    expect(onMatchSong).toHaveBeenCalledWith(
      expect.objectContaining({ key: "trapt" }),
      expect.objectContaining({ id: "t" })
    );
  });

  it("acts on every file of the groups someone selected", () => {
    listQuery = listOf([group()]);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);
    fireEvent.click(screen.getByRole("checkbox", { name: /Select The Beatles/ }));
    fireEvent.click(screen.getByRole("button", { name: "Ignore" }));

    expect(state.ignore).toHaveBeenCalledWith({ fileIds: ["a", "b"] });
  });

  it("searches every waiting file again from one button", () => {
    listQuery = listOf([group()]);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Try all again" }));

    expect(state.retry).toHaveBeenCalledWith({ kind: "all" });
  });

  it("shows a group being searched again instead of offering actions on it", () => {
    listQuery = listOf([group({ retrying: 2 })]);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.getByText("Searching again…")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Match to an album/ })).not.toBeInTheDocument();
  });

  it("says all caught up when nothing waits", () => {
    listQuery = listOf([], { review: 0, ignored: 0 });

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.getByText("All caught up")).toBeInTheDocument();
  });

  it("asks for the ignored files when nothing waits but something was ignored", () => {
    listQuery = listOf([], { review: 0, ignored: 3 });

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(state.lastInput).toEqual(expect.objectContaining({ tab: "ignored" }));
  });

  it("brings an ignored release back to be searched", () => {
    listQuery = listOf([group({ ignoredAt: new Date() })], { review: 0, ignored: 2 });

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Stop ignoring/ }));

    expect(state.stopIgnoring).toHaveBeenCalledWith({ fileIds: ["a", "b"], searchAgain: true });
  });

  it("warns when the list was cut short", () => {
    listQuery = listOf([group()], { review: 2, ignored: 0 }, true);

    render(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.getByText("Only part of the list is shown")).toBeInTheDocument();
  });

  it("leaves the dialog title to the view in front while it waits behind a match", () => {
    listQuery = listOf([group()]);

    const { rerender } = render(<ReviewList enabled active={false} onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.queryByRole("heading", { name: "Songs to review" })).not.toBeInTheDocument();

    rerender(<ReviewList enabled active onMatchAlbum={vi.fn()} onMatchSong={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Songs to review" })).toBeInTheDocument();
  });
});
