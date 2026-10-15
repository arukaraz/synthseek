import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createErrorQuery, createLoadingQuery, createMockQuery } from "@test/mocks/trpc.mock";

import { DEFAULT_TEMPLATE, makeArchive, makeOrganiseStatus, makePath, makeRule, MEMBERS } from "./fixtures";

interface CardState {
  paths: unknown;
  rules: unknown;
  organise: unknown;
  setEnabled: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted(() => {
  const initial: CardState = { paths: undefined, rules: undefined, organise: undefined, setEnabled: vi.fn() };
  return initial;
});

vi.mock("@hooks/api/queries/useLibraryPaths", () => ({
  useLibraryPaths: () => state.paths,
  useJudgeLibraryFolder: () => createMockQuery(undefined, { isSuccess: false }),
  useCheckLibraryFolder: () => createMockQuery(undefined, { isSuccess: false }),
}));

vi.mock("@hooks/api/queries/useLibraryRules", () => ({
  useLibraryRules: () => state.rules,
}));

vi.mock("@hooks/api/queries/useUsers", () => ({
  useUsers: () => createMockQuery(MEMBERS),
}));

vi.mock("@hooks/api/queries/useLibraryOrganise", () => ({
  useLibraryOrganiseStatus: () => state.organise,
}));

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingCurrent: () => createMockQuery({ defaultTemplate: DEFAULT_TEMPLATE, tokens: [] }),
  useLibraryNamingPreview: () => createMockQuery(undefined, { isSuccess: false }),
  useLibraryNamingSamples: () => createMockQuery(undefined, { isSuccess: false }),
  useLibraryNamingMoves: () => createMockQuery(undefined, { isSuccess: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryPaths", () => ({
  useSetLibraryPathEnabled: () => ({ mutate: state.setEnabled, isPending: false }),
  useCreateLibraryPath: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateLibraryPath: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveLibraryPath: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryOrganiseControls", () => ({
  useCancelLibraryOrganise: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryNaming", () => ({
  useSaveAndOrganise: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { LibraryPathsCard } from "../LibraryPathsCard";

function row(label: string) {
  return within(screen.getByRole("listitem", { name: label }));
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.paths = createMockQuery([makePath(), makeArchive()]);
  state.rules = createMockQuery([
    makeRule({ libraryPathId: "archive" }),
    makeRule({ id: "rule-ost", name: "Soundtracks", position: 1, libraryPathId: "archive" }),
  ]);
  state.organise = createMockQuery(makeOrganiseStatus());
  state.setEnabled = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LibraryPathsCard", () => {
  it("lists every library path with its name, folder and whether it can be reached", () => {
    render(<LibraryPathsCard />);

    expect(row("Music").getByText("/music")).toBeInTheDocument();
    expect(row("Music").getByText(enSettings.libraryPaths.status.writable)).toBeInTheDocument();
    expect(row("Archive").getByText("/mnt/archive")).toBeInTheDocument();
  });

  it("shows what each path holds, how much room is left and how many rules send music to it", () => {
    render(<LibraryPathsCard />);

    expect(row("Music").getByText("7,415 files")).toBeInTheDocument();
    expect(row("Music").getByText(/free$/)).toBeInTheDocument();
    expect(row("Music").getByText("0 rules")).toBeInTheDocument();
    expect(row("Archive").getByText("2 rules")).toBeInTheDocument();
  });

  it("offers nothing on a row but the edit button and the switch", () => {
    render(<LibraryPathsCard />);

    const buttons = row("Archive").getAllByRole("button");
    expect(buttons).toHaveLength(1);
    expect(buttons[0]).toHaveAccessibleName("Edit Archive");
    expect(row("Archive").getAllByRole("switch")).toHaveLength(1);
  });

  it("turns a path off from its switch", async () => {
    const user = userEvent.setup();
    render(<LibraryPathsCard />);

    await user.click(row("Archive").getByRole("switch", { name: "Use Archive" }));

    expect(state.setEnabled).toHaveBeenCalledWith({ id: "archive", enabled: false });
  });

  it("does not let the default path be turned off, since music would have nowhere to go", () => {
    render(<LibraryPathsCard />);

    expect(row("Music").getByRole("switch", { name: "Use Music" })).toBeDisabled();
    expect(row("Music").getByText(enSettings.libraryPaths.defaultBadge)).toBeInTheDocument();
  });

  it("says a path that is turned off is turned off, whatever its folder answers", () => {
    state.paths = createMockQuery([makePath(), makeArchive({ enabled: false })]);

    render(<LibraryPathsCard />);

    expect(row("Archive").getByText(enSettings.libraryPaths.status.disabled)).toBeInTheDocument();
  });

  it("marks the path whose folder comes from the environment", () => {
    render(<LibraryPathsCard />);

    expect(row("Music").getByText("MUSIC_LIBRARY_PATH")).toBeInTheDocument();
    expect(row("Archive").queryByText("MUSIC_LIBRARY_PATH")).not.toBeInTheDocument();
  });

  it("says the free space is unknown when the disk does not answer", () => {
    state.paths = createMockQuery([makePath(), makeArchive({ access: "unreachable", freeBytes: null })]);

    render(<LibraryPathsCard />);

    expect(row("Archive").getByText(enSettings.libraryPaths.freeUnknown)).toBeInTheDocument();
    expect(row("Archive").getByText(enSettings.libraryPaths.status.unreachable)).toBeInTheDocument();
    expect(screen.getByText(/Archive cannot be reached/)).toBeInTheDocument();
  });

  it("shows a move in progress on the path it is moving, and only there", () => {
    state.organise = createMockQuery(
      makeOrganiseStatus({ running: true, pathId: "archive", processed: 1204, total: 7415 })
    );

    render(<LibraryPathsCard />);

    expect(row("Archive").getByText(/1,204 of 7,415 moved/)).toBeInTheDocument();
    expect(row("Music").queryByText(/moved/)).not.toBeInTheDocument();
  });

  it("opens the path's settings from its edit button", async () => {
    const user = userEvent.setup();
    render(<LibraryPathsCard />);

    await user.click(row("Archive").getByRole("button", { name: "Edit Archive" }));

    expect(await screen.findByRole("dialog", { name: "Edit Archive" })).toBeInTheDocument();
  });

  it("opens an empty form to add a path", async () => {
    const user = userEvent.setup();
    render(<LibraryPathsCard />);

    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.add }));

    expect(await screen.findByRole("dialog", { name: enSettings.libraryPaths.modal.addTitle })).toBeInTheDocument();
  });

  it("says it is loading rather than showing an empty list", () => {
    state.paths = createLoadingQuery();

    render(<LibraryPathsCard />);

    expect(screen.getByText(enSettings.libraryPaths.loading)).toBeInTheDocument();
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("says so when the paths cannot be read", () => {
    state.paths = createErrorQuery(new Error("offline"));

    render(<LibraryPathsCard />);

    expect(screen.getByText(enSettings.libraryPaths.loadFailed)).toBeInTheDocument();
  });
});
