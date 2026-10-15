import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

const TEMPLATE = "{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}.{ext}";

const PATH_ID = "archive";

interface PreviewState {
  moves: unknown;
  applyMutate: ReturnType<typeof vi.fn>;
  moveCalls: { pathId: string; template: string; classes: readonly string[] }[];
  previewCalls: { pathId: string; template: string }[];
}

const state = vi.hoisted(() => {
  const initial: PreviewState = { moves: undefined, applyMutate: vi.fn(), moveCalls: [], previewCalls: [] };
  return initial;
});

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingPreview: (input: { pathId: string; template: string }) => {
    state.previewCalls.push(input);
    return createMockQuery({
      outcome: "valid",
      inPlace: 81,
      moves: 163,
      rejected: 20,
      rejectionsByReason: [],
      moveSample: [],
    });
  },
  useLibraryNamingMoves: (input: { pathId: string; template: string; classes: readonly string[] }) => {
    state.moveCalls.push({ pathId: input.pathId, template: input.template, classes: input.classes });
    return state.moves;
  },
}));

vi.mock("@hooks/api/mutations/library/useLibraryNaming", () => ({
  useSaveAndOrganise: () => ({ mutate: state.applyMutate, isPending: false }),
}));

import { PreviewModal } from "../PreviewModal";

const BY_CLASS = [
  { moveClass: "relocate", count: 111 },
  { moveClass: "rename", count: 38 },
  { moveClass: "reassign", count: 14 },
];

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.moves = createMockQuery({
    outcome: "valid",
    items: [{ from: "pearl jam/dark matter/03 - wreckage.mp3", to: "Pearl Jam/Wreckage/01 - Wreckage.mp3" }],
    total: 163,
    matched: 163,
    byClass: BY_CLASS,
  });
  state.applyMutate = vi.fn();
  state.moveCalls = [];
  state.previewCalls = [];
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

function open() {
  render(<PreviewModal open onOpenChange={vi.fn()} pathId={PATH_ID} pathLabel="Archive" template={TEMPLATE} />);
}

describe("PreviewModal", () => {
  it("names the library path it is planning, since each path has its own naming", () => {
    open();

    expect(screen.getByRole("heading", { name: "What would change in Archive" })).toBeInTheDocument();
  });

  it("asks about the one library path being edited, for the counts and for the list", () => {
    open();

    expect(state.previewCalls.length).toBeGreaterThan(0);
    expect(state.previewCalls.every((call) => call.pathId === PATH_ID)).toBe(true);
    expect(state.moveCalls.length).toBeGreaterThan(0);
    expect(state.moveCalls.every((call) => call.pathId === PATH_ID)).toBe(true);
  });

  it("splits the songs that change album off from the spelling fixes, which have nothing in common but a new name", () => {
    open();

    expect(screen.getByRole("tab", { name: /Only the spelling/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /A new folder/ })).toBeInTheDocument();
  });

  it("groups the thousands in a tab count, which on a real library runs to four digits", () => {
    state.moves = createMockQuery({
      outcome: "valid",
      items: [],
      total: 7577,
      matched: 7577,
      byClass: [
        { moveClass: "relocate", count: 3893 },
        { moveClass: "rename", count: 1633 },
        { moveClass: "reassign", count: 2051 },
      ],
    });

    open();

    expect(screen.getByRole("tab", { name: /Everything/ })).toHaveTextContent("7,577");
    expect(screen.getByRole("tab", { name: /Only the folder/ })).toHaveTextContent("3,893");
  });

  it("counts the three lists separately and adds them up on the everything tab", () => {
    open();

    expect(screen.getByRole("tab", { name: /Only the folder/ })).toHaveTextContent("111");
    expect(screen.getByRole("tab", { name: /Only the spelling/ })).toHaveTextContent("38");
    expect(screen.getByRole("tab", { name: /A new folder/ })).toHaveTextContent("14");
    expect(screen.getByRole("tab", { name: /Everything/ })).toHaveTextContent("163");
  });

  it("shows the format the way the reader typed it, without the extension they were never allowed to write", () => {
    open();

    expect(screen.getByText("{albumartist}/{album}/<Disc {disc:02d}>/{track:02d} - {title}")).toBeInTheDocument();
  });

  it("still asks the server about the whole format, extension included, since that is what it validates", () => {
    open();

    expect(state.moveCalls.every((call) => call.template === TEMPLATE)).toBe(true);
  });

  it("keeps the explanation out of the way until it is asked for", () => {
    open();

    expect(screen.queryByText(enSettings.libraryNaming.preview.info.lists)).not.toBeInTheDocument();
  });

  it("explains every list the tabs offer, so none of them is left for the reader to guess at", async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole("button", { name: enSettings.libraryNaming.preview.info.open }));

    expect(screen.getByText(enSettings.libraryNaming.preview.info.counts)).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryNaming.preview.info.relocateText)).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryNaming.preview.info.renameText)).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryNaming.preview.info.reassignText)).toBeInTheDocument();
  });

  it("pushes the list down rather than taking it away, so the explanation can be read against the rows it describes", async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole("button", { name: enSettings.libraryNaming.preview.info.open }));

    expect(screen.getByText(enSettings.libraryNaming.preview.info.lists)).toBeInTheDocument();
    expect(screen.getByText("Pearl Jam/Wreckage/01 - Wreckage.mp3")).toBeInTheDocument();
    expect(screen.getByRole("searchbox")).toBeInTheDocument();
  });

  it("warns on the list where a song changes album, which the reader cannot tell from a tidier name", async () => {
    const user = userEvent.setup();
    open();

    expect(screen.queryByText(enSettings.libraryNaming.preview.reassignWarning)).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /A new folder/ }));

    expect(screen.getByText(enSettings.libraryNaming.preview.reassignWarning)).toBeInTheDocument();
  });

  it("moves only the open list, which is what the explanation promises the button does", async () => {
    const user = userEvent.setup();
    open();

    await user.click(screen.getByRole("tab", { name: /A new folder/ }));
    await user.click(screen.getByRole("button", { name: /Move 14 songs/ }));
    await user.click(screen.getByRole("button", { name: enSettings.libraryNaming.preview.confirmYes }));

    expect(state.applyMutate).toHaveBeenCalledWith(
      { pathId: PATH_ID, template: TEMPLATE, classes: ["reassign"] },
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
  });

  it("asks the server for every class at once on the everything tab, so no list is silently left behind", () => {
    open();

    expect(state.moveCalls).toContainEqual({
      pathId: PATH_ID,
      template: TEMPLATE,
      classes: ["relocate", "rename", "reassign"],
    });
  });
});
