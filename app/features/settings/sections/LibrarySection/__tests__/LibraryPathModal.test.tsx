import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

import type { LibraryPathSummary, LibraryRule, PathWriteResult } from "../types";
import { DEFAULT_TEMPLATE, makeArchive, makeOrganiseStatus, makePath, makeRule, MEMBERS } from "./fixtures";

interface MutateOptions<T> {
  onSuccess?: (result: T) => void;
}

const idle = () => createMockQuery(undefined, { isSuccess: false });

interface ModalState {
  judge: unknown;
  check: unknown;
  preview: unknown;
  previewCalls: { pathId: string; template: string; enabled: boolean }[];
  moveCalls: { pathId: string }[];
  writeResult: unknown;
  removeResult: unknown;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted(() => {
  const initial: ModalState = {
    judge: undefined,
    check: undefined,
    preview: undefined,
    previewCalls: [],
    moveCalls: [],
    writeResult: undefined,
    removeResult: undefined,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  };
  return initial;
});

vi.mock("@hooks/api/queries/useLibraryPaths", () => ({
  useLibraryPaths: () => createMockQuery([]),
  useJudgeLibraryFolder: (_input: unknown, enabled: boolean) => (enabled ? state.judge : idle()),
  useCheckLibraryFolder: (_input: unknown, enabled: boolean) => (enabled ? state.check : idle()),
}));

vi.mock("@hooks/api/queries/useLibraryNaming", () => ({
  useLibraryNamingCurrent: () => createMockQuery({ defaultTemplate: DEFAULT_TEMPLATE, tokens: [] }),
  useLibraryNamingPreview: (input: { pathId: string; template: string }, enabled: boolean) => {
    state.previewCalls.push({ ...input, enabled });
    return enabled ? state.preview : idle();
  },
  useLibraryNamingSamples: () => idle(),
  useLibraryNamingMoves: (input: { pathId: string }) => {
    state.moveCalls.push({ pathId: input.pathId });
    return idle();
  },
}));

vi.mock("@hooks/api/mutations/library/useLibraryPaths", () => ({
  useCreateLibraryPath: () => ({ mutate: state.create, isPending: false }),
  useUpdateLibraryPath: () => ({ mutate: state.update, isPending: false }),
  useRemoveLibraryPath: () => ({ mutate: state.remove, isPending: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryOrganiseControls", () => ({
  useCancelLibraryOrganise: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("@hooks/api/mutations/library/useLibraryNaming", () => ({
  useSaveAndOrganise: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { LibraryPathModal } from "../LibraryPathModal";

const MUSIC = makePath();
const ARCHIVE = makeArchive();
const RULES: LibraryRule[] = [
  makeRule({ libraryPathId: "archive" }),
  makeRule({ id: "rule-ost", name: "Soundtracks", position: 1, libraryPathId: "archive" }),
  makeRule({
    id: "rule-free",
    name: "Old jazz",
    position: 2,
    conditions: [{ field: "year", op: "before", value: 1970 }],
  }),
];

function openAdd(paths: LibraryPathSummary[] = [MUSIC, ARCHIVE]) {
  const onClose = vi.fn();
  render(
    <LibraryPathModal
      target={{ mode: "add" }}
      paths={paths}
      rules={RULES}
      members={MEMBERS}
      organise={makeOrganiseStatus()}
      onClose={onClose}
    />
  );
  return { onClose };
}

function openEdit(path: LibraryPathSummary, paths: LibraryPathSummary[] = [MUSIC, ARCHIVE]) {
  const onClose = vi.fn();
  render(
    <LibraryPathModal
      target={{ mode: "edit", pathId: path.id }}
      paths={paths.map((entry) => (entry.id === path.id ? path : entry))}
      rules={RULES}
      members={MEMBERS}
      organise={makeOrganiseStatus()}
      onClose={onClose}
    />
  );
  return { onClose };
}

function answerWith(result: PathWriteResult) {
  state.writeResult = result;
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.judge = idle();
  state.check = idle();
  state.preview = createMockQuery({
    outcome: "valid",
    inPlace: 10,
    moves: 42,
    rejected: 0,
    rejectionsByReason: [],
    moveSample: [],
  });
  state.previewCalls = [];
  state.moveCalls = [];
  state.writeResult = { outcome: "saved", id: "archive" };
  state.removeResult = { outcome: "removed" };
  state.create = vi.fn((_input: unknown, options?: MutateOptions<unknown>) => options?.onSuccess?.(state.writeResult));
  state.update = vi.fn((_input: unknown, options?: MutateOptions<unknown>) => options?.onSuccess?.(state.writeResult));
  state.remove = vi.fn((_input: unknown, options?: MutateOptions<unknown>) => options?.onSuccess?.(state.removeResult));
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the default path toggle", () => {
  it("names the path that takes unmatched music today when this one does not", () => {
    openEdit(ARCHIVE);

    expect(screen.getByText("Music that matches no rule is saved here. Right now that is Music.")).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.libraryPaths.default.label })).toBeEnabled();
  });

  it("says where to change it when this path is the default, and cannot be turned off here", () => {
    openEdit(MUSIC);

    expect(
      screen.getByText("Music that matches no rule is saved here. To change it, turn this on in another library path.")
    ).toBeInTheDocument();
    const toggle = screen.getByRole("switch", { name: enSettings.libraryPaths.default.label });
    expect(toggle).toBeDisabled();
    expect(toggle).toBeChecked();
  });

  it("refuses the default on a path whose folder is read-only", () => {
    openEdit(makeArchive({ access: "readonly" }));

    expect(screen.getByText(enSettings.libraryPaths.default.readonly)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.libraryPaths.default.label })).toBeDisabled();
  });

  it("refuses the default as soon as the new folder turns out to be read-only", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/mnt/ro", access: "readonly" });
    openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/mnt/ro");

    await waitFor(() => expect(screen.getByText(enSettings.libraryPaths.default.readonly)).toBeInTheDocument());
    expect(screen.getByText(enSettings.libraryPaths.folder.readonly)).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: enSettings.libraryPaths.default.label })).toBeDisabled();
  });

  it("says why the server refused to make a read-only path the default", async () => {
    const user = userEvent.setup();
    answerWith({ outcome: "readonly_default" });
    openEdit(ARCHIVE);

    await user.click(screen.getByRole("switch", { name: enSettings.libraryPaths.default.label }));
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save }));

    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: "archive", isDefault: true }),
      expect.anything()
    );
    expect(screen.getByText(enSettings.libraryPaths.default.readonly)).toBeInTheDocument();
  });
});

describe("the folder", () => {
  it("explains a folder that sits inside another library path, and will not save it", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({
      outcome: "refused",
      folder: "/music/soundtracks",
      problem: "inside_path",
      label: "Music",
    });
    openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.label.label), "Soundtracks");
    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/music/soundtracks");

    await waitFor(() =>
      expect(
        screen.getByText("This folder is inside Music. Pick a folder outside every other library path.")
      ).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add })).toBeDisabled();
  });

  it("tells the reader to mount a folder Synthseek cannot see", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "refused", folder: "/srv/media", problem: "not_found" });
    openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/srv/media");

    await waitFor(() => expect(screen.getByText(/Synthseek cannot see \/srv\/media\./)).toBeInTheDocument());
  });

  it("shows the refusal the server gave on save, even when the live check had passed", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/mnt/new", access: "writable" });
    answerWith({
      outcome: "folder_refused",
      verdict: { outcome: "refused", folder: "/mnt/new", problem: "contains_path", label: "Archive" },
    });
    openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.label.label), "New");
    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/mnt/new");
    await waitFor(() => expect(screen.getByText(enSettings.libraryPaths.folder.usable)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add }));

    expect(
      screen.getByText("Archive is inside this folder. Library paths cannot contain each other.")
    ).toBeInTheDocument();
  });

  it("does not offer to change a folder that comes from the environment", () => {
    openEdit(MUSIC);

    expect(screen.getByLabelText(enSettings.libraryPaths.folder.label)).toBeDisabled();
    expect(screen.getByText(enSettings.libraryPaths.folder.fromEnvironment)).toBeInTheDocument();
  });

  it("asks for a sample of the files before a path that holds music moves to a new folder", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/mnt/new-disk/archive", access: "writable" });
    state.check = createMockQuery({ folder: "/mnt/new-disk/archive", sampled: 200, found: 200 });
    openEdit(makeArchive({ files: 1200 }));

    const field = screen.getByLabelText(enSettings.libraryPaths.folder.label);
    await user.clear(field);
    await user.type(field, "/mnt/new-disk/archive");
    const check = await screen.findByRole("button", { name: enSettings.libraryPaths.folder.check.action });
    await waitFor(() => expect(check).toBeEnabled());
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save })).toBeDisabled();

    await user.click(check);

    expect(screen.getByText(/Found 200 of 200 sampled files in the new folder/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save })).toBeEnabled();
  });

  it("keeps the save closed when the sampled files are not in the new folder", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/mnt/empty", access: "writable" });
    state.check = createMockQuery({ folder: "/mnt/empty", sampled: 200, found: 0 });
    openEdit(makeArchive({ files: 1200 }));

    const field = screen.getByLabelText(enSettings.libraryPaths.folder.label);
    await user.clear(field);
    await user.type(field, "/mnt/empty");
    const check = await screen.findByRole("button", { name: enSettings.libraryPaths.folder.check.action });
    await waitFor(() => expect(check).toBeEnabled());
    await user.click(check);

    expect(screen.getByText(/The music of Archive is not in this folder/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save })).toBeDisabled();
  });
});

describe("the rules a path uses", () => {
  it("shows a rule another path uses as taken, and does not let this path take it", () => {
    openEdit(MUSIC);

    expect(screen.getByRole("checkbox", { name: "Soundtracks" })).toBeDisabled();
    expect(screen.getAllByText("Used by Archive")).toHaveLength(2);
    expect(screen.getByRole("checkbox", { name: "Old jazz" })).toBeEnabled();
  });

  it("saves the rules picked, together with the rest of the path", async () => {
    const user = userEvent.setup();
    openEdit(MUSIC);

    await user.click(screen.getByRole("checkbox", { name: "Old jazz" }));
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save }));

    expect(state.update).toHaveBeenCalledWith(
      expect.objectContaining({ id: "primary", ruleIds: ["rule-free"] }),
      expect.anything()
    );
  });
});

describe("the track naming", () => {
  it("plans the preview against this path, not the whole library", async () => {
    openEdit(ARCHIVE);

    await waitFor(() => expect(state.previewCalls.some((call) => call.enabled)).toBe(true));
    expect(state.previewCalls.filter((call) => call.enabled).every((call) => call.pathId === "archive")).toBe(true);
  });

  it("opens what would change for this path", async () => {
    const user = userEvent.setup();
    openEdit(ARCHIVE);

    const preview = screen.getByRole("button", { name: enSettings.libraryPaths.naming.preview });
    await waitFor(() => expect(preview).toBeEnabled());
    await user.click(preview);

    expect(await screen.findByRole("dialog", { name: "What would change in Archive" })).toBeInTheDocument();
    expect(state.moveCalls.length).toBeGreaterThan(0);
    expect(state.moveCalls.every((call) => call.pathId === "archive")).toBe(true);
  });

  it("says how many songs would move inside this path", async () => {
    openEdit(ARCHIVE);

    await waitFor(() => expect(screen.getByText("42 songs would move inside Archive.")).toBeInTheDocument());
  });

  it("has nothing to preview on a path that does not exist yet", () => {
    openAdd();

    expect(screen.getByText(enSettings.libraryPaths.naming.addHint)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.naming.preview })).toBeDisabled();
    expect(state.previewCalls.every((call) => call.enabled === false)).toBe(true);
  });

  it("will not save a format the server says is unusable", async () => {
    state.preview = createMockQuery({ outcome: "invalid", problem: "MISSING_EXTENSION", detail: "" });
    openEdit(ARCHIVE);

    await waitFor(() =>
      expect(screen.getByText(enSettings.libraryNaming.problem.MISSING_EXTENSION)).toBeInTheDocument()
    );
    expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.save })).toBeDisabled();
  });
});

describe("adding a path", () => {
  it("sends the name, the folder, the rules and the default format", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/music-soundtracks", access: "writable" });
    const { onClose } = openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.label.label), "Soundtracks");
    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/music-soundtracks");
    await user.click(screen.getByRole("checkbox", { name: "Old jazz" }));
    await waitFor(() => expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add }));

    expect(state.create).toHaveBeenCalledWith(
      {
        label: "Soundtracks",
        folder: "/music-soundtracks",
        isDefault: false,
        ruleIds: ["rule-free"],
        namingTemplate: DEFAULT_TEMPLATE,
      },
      expect.anything()
    );
    expect(onClose).toHaveBeenCalled();
  });

  it("keeps the form open and says so when the name is taken", async () => {
    const user = userEvent.setup();
    state.judge = createMockQuery({ outcome: "usable", folder: "/mnt/x", access: "writable" });
    answerWith({ outcome: "label_taken" });
    const { onClose } = openAdd();

    await user.type(screen.getByLabelText(enSettings.libraryPaths.label.label), "Music");
    await user.type(screen.getByLabelText(enSettings.libraryPaths.folder.label), "/mnt/x");
    await waitFor(() => expect(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.modal.add }));

    expect(screen.getByText(enSettings.libraryPaths.label.taken)).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });
});

describe("removing a path", () => {
  it("lists what stands in the way when the server will not remove it", async () => {
    const user = userEvent.setup();
    state.removeResult = {
      outcome: "blocked",
      blockers: [
        { reason: "default_path" },
        { reason: "has_rules", count: 2 },
        { reason: "has_songs", count: 1200 },
        { reason: "pending_downloads", count: 3 },
      ],
    };
    const { onClose } = openEdit(ARCHIVE);

    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.remove.action }));
    await user.click(await screen.findByRole("button", { name: enSettings.libraryPaths.remove.confirmYes }));

    expect(state.remove).toHaveBeenCalledWith({ id: "archive", forgetSongs: false }, expect.anything());
    expect(screen.getByText("Archive cannot be removed yet")).toBeInTheDocument();
    expect(screen.getByText(enSettings.libraryPaths.remove.blocker.default_path)).toBeInTheDocument();
    expect(screen.getByText("It uses 2 rules. Untick them first.")).toBeInTheDocument();
    expect(screen.getByText(/1,200 songs still have their files here/)).toBeInTheDocument();
    expect(screen.getByText("3 downloads are on their way to it.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: enSettings.libraryPaths.remove.forgetAction })).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("offers to remove the path with its songs when they are all that stands in the way", async () => {
    const user = userEvent.setup();
    state.removeResult = { outcome: "blocked", blockers: [{ reason: "has_songs", count: 2 }] };
    const { onClose } = openEdit(ARCHIVE);

    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.remove.action }));
    await user.click(await screen.findByRole("button", { name: enSettings.libraryPaths.remove.confirmYes }));
    state.removeResult = { outcome: "removed" };
    await user.click(await screen.findByRole("button", { name: enSettings.libraryPaths.remove.forgetAction }));

    expect(
      await screen.findByText("2 songs leave the library and any playlist they are in. Their files stay on disk.")
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.remove.forgetConfirmYes }));

    expect(state.remove).toHaveBeenLastCalledWith({ id: "archive", forgetSongs: true }, expect.anything());
    expect(onClose).toHaveBeenCalled();
  });

  it("closes once the path is gone", async () => {
    const user = userEvent.setup();
    const { onClose } = openEdit(ARCHIVE);

    await user.click(screen.getByRole("button", { name: enSettings.libraryPaths.remove.action }));
    await user.click(await screen.findByRole("button", { name: enSettings.libraryPaths.remove.confirmYes }));

    expect(onClose).toHaveBeenCalled();
  });

  it("is not offered while adding a path", () => {
    openAdd();

    expect(screen.queryByRole("button", { name: enSettings.libraryPaths.remove.action })).not.toBeInTheDocument();
  });
});
