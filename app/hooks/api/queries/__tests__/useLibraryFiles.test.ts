import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

interface StatusOptions {
  enabled: boolean;
  refetchInterval: (query: { state: { data: { running: boolean } | undefined } }) => number | false;
}

const spies = vi.hoisted(() => ({
  statusOptions: undefined as StatusOptions | undefined,
  previewInput: undefined as unknown,
  invalidations: [] as string[],
}));

function invalidator(name: string) {
  return { invalidate: () => spies.invalidations.push(name) };
}

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        getTracks: invalidator("getTracks"),
        getAlbums: invalidator("getAlbums"),
        getArtists: invalidator("getArtists"),
        getPlaylists: invalidator("getPlaylists"),
        getCounts: invalidator("getCounts"),
        paths: { list: invalidator("paths.list") },
      },
    }),
    library: {
      files: {
        status: {
          useQuery: (_input: unknown, options: StatusOptions) => {
            spies.statusOptions = options;
            return { data: undefined };
          },
        },
        previewMove: {
          useQuery: (input: unknown) => {
            spies.previewInput = input;
            return { data: undefined };
          },
        },
      },
    },
  },
}));

import { skipToken } from "@tanstack/react-query";

import { useLibraryFilesStatus, useLibraryMovePreview, useRefreshLibraryAfterFileJob } from "../useLibraryFiles";

function interval(running: boolean | undefined): number | false {
  const options = spies.statusOptions;
  if (options === undefined) throw new Error("the status query was never wired");
  return options.refetchInterval({ state: { data: running === undefined ? undefined : { running } } });
}

beforeEach(() => {
  spies.statusOptions = undefined;
  spies.previewInput = undefined;
  spies.invalidations = [];
});

describe("useLibraryFilesStatus", () => {
  it("does not poll while nothing is being watched and nothing runs", () => {
    renderHook(() => useLibraryFilesStatus(true, false));

    expect(interval(false)).toBe(false);
    expect(interval(undefined)).toBe(false);
  });

  it("polls while a job this page started is being watched, even before the first answer", () => {
    renderHook(() => useLibraryFilesStatus(true, true));

    expect(interval(undefined)).toBeGreaterThan(0);
  });

  it("keeps polling a job that is still running", () => {
    renderHook(() => useLibraryFilesStatus(true, false));

    expect(interval(true)).toBeGreaterThan(0);
  });

  it("stays off for someone who may not ask", () => {
    renderHook(() => useLibraryFilesStatus(false, false));

    expect(spies.statusOptions?.enabled).toBe(false);
  });
});

describe("useLibraryMovePreview", () => {
  it("asks for nothing until a path is chosen", () => {
    renderHook(() => useLibraryMovePreview(null));

    expect(spies.previewInput).toBe(skipToken);
  });

  it("asks with the chosen path and selection", () => {
    const input = { selection: { trackIds: ["a"], albumIds: [] }, targetPathId: "archive" };
    renderHook(() => useLibraryMovePreview(input));

    expect(spies.previewInput).toEqual(input);
  });
});

describe("useRefreshLibraryAfterFileJob", () => {
  it("refreshes every library list a move or delete changes, and the paths' file counts", () => {
    const { result } = renderHook(() => useRefreshLibraryAfterFileJob());
    result.current();

    expect(spies.invalidations.sort()).toEqual(
      ["getAlbums", "getArtists", "getCounts", "getPlaylists", "getTracks", "paths.list"].sort()
    );
  });
});
