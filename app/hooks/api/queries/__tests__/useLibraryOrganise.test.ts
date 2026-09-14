import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { createElement } from "react";

import { useLibraryOrganiseStatus } from "../useLibraryOrganise";

const state = vi.hoisted(() => ({
  status: { running: false } as { running: boolean } | undefined,
  namingPreview: vi.fn(),
  namingMoves: vi.fn(),
  organisePreview: vi.fn(),
}));

vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({
      library: {
        naming: {
          preview: { invalidate: state.namingPreview },
          moves: { invalidate: state.namingMoves },
        },
        organise: { preview: { invalidate: state.organisePreview } },
      },
    }),
    library: {
      organise: {
        status: { useQuery: () => ({ data: state.status }) },
        preview: { useQuery: () => ({ data: undefined }) },
      },
    },
  },
}));

function Probe() {
  useLibraryOrganiseStatus();
  return null;
}

const invalidations = () =>
  state.namingPreview.mock.calls.length + state.namingMoves.mock.calls.length + state.organisePreview.mock.calls.length;

beforeEach(() => {
  state.status = { running: false };
  state.namingPreview.mockClear();
  state.namingMoves.mockClear();
  state.organisePreview.mockClear();
});

afterEach(() => cleanup());

describe("useLibraryOrganiseStatus", () => {
  it("asks for nothing again while a run is still going, since the counts are still moving", () => {
    state.status = { running: true };
    const view = render(createElement(Probe));
    view.rerender(createElement(Probe));

    expect(invalidations()).toBe(0);
  });

  it("refreshes the counts once a run finishes, so the button stops offering a move that already happened", () => {
    state.status = { running: true };
    const view = render(createElement(Probe));

    state.status = { running: false };
    view.rerender(createElement(Probe));

    expect(state.namingPreview).toHaveBeenCalledTimes(1);
    expect(state.namingMoves).toHaveBeenCalledTimes(1);
    expect(state.organisePreview).toHaveBeenCalledTimes(1);
  });

  it("refreshes nothing on a page that simply opens with no run in flight", () => {
    const view = render(createElement(Probe));
    view.rerender(createElement(Probe));

    expect(invalidations()).toBe(0);
  });

  it("refreshes nothing before the first status answer arrives, which is not a finished run", () => {
    state.status = undefined;
    const view = render(createElement(Probe));
    view.rerender(createElement(Probe));

    expect(invalidations()).toBe(0);
  });
});
