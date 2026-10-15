import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";

import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery } from "@test/mocks/trpc.mock";

import { makeArchive, makePath, makeRule, MEMBERS } from "./fixtures";

interface MutateOptions<T> {
  onSuccess?: (result: T) => void;
}

interface CardState {
  rules: unknown;
  writeResult: unknown;
  create: ReturnType<typeof vi.fn>;
  update: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  reorder: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted(() => {
  const initial: CardState = {
    rules: undefined,
    writeResult: undefined,
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    reorder: vi.fn(),
  };
  return initial;
});

vi.mock("@hooks/api/queries/useLibraryRules", () => ({
  useLibraryRules: () => state.rules,
}));

vi.mock("@hooks/api/queries/useLibraryPaths", () => ({
  useLibraryPaths: () => createMockQuery([makePath(), makeArchive()]),
}));

vi.mock("@hooks/api/queries/useUsers", () => ({
  useUsers: () => createMockQuery(MEMBERS),
}));

vi.mock("@hooks/api/mutations/library/useLibraryRules", () => ({
  useCreateLibraryRule: () => ({ mutate: state.create, isPending: false }),
  useUpdateLibraryRule: () => ({ mutate: state.update, isPending: false }),
  useRemoveLibraryRule: () => ({ mutate: state.remove, isPending: false }),
  useReorderLibraryRules: () => ({ mutate: state.reorder, isPending: false }),
}));

import { LibraryRulesCard } from "../LibraryRulesCard";

const ANA = makeRule({ libraryPathId: "archive" });
const OST = makeRule({
  id: "rule-ost",
  name: "Soundtracks",
  position: 1,
  matchMode: "any",
  conditions: [
    { field: "genre", op: "contains", value: "Soundtrack" },
    { field: "artist", op: "is", value: "Hans Zimmer" },
  ],
});
const JAZZ = makeRule({
  id: "rule-jazz",
  name: "Old jazz",
  position: 2,
  conditions: [
    { field: "year", op: "before", value: 1970 },
    { field: "quality", op: "is", value: "lossless" },
  ],
});

function row(name: string) {
  return within(screen.getByRole("listitem", { name }));
}

async function pick(user: ReturnType<typeof userEvent.setup>, trigger: string, option: string) {
  await user.click(screen.getByRole("button", { name: trigger }));
  await user.click(await screen.findByRole("menuitemradio", { name: option }));
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  state.rules = createMockQuery([JAZZ, ANA, OST]);
  state.writeResult = { outcome: "saved", id: "rule-new" };
  state.create = vi.fn((_input: unknown, options?: MutateOptions<unknown>) => options?.onSuccess?.(state.writeResult));
  state.update = vi.fn((_input: unknown, options?: MutateOptions<unknown>) => options?.onSuccess?.(state.writeResult));
  state.remove = vi.fn();
  state.reorder = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("the rules list", () => {
  it("lists the rules in priority order, whatever order they arrive in", () => {
    render(<LibraryRulesCard />);

    const names = screen.getAllByRole("listitem").map((item) => item.getAttribute("aria-label"));
    expect(names).toEqual(["Ana's music", "Soundtracks", "Old jazz"]);
    expect(row("Ana's music").getByText("Priority 1")).toBeInTheDocument();
    expect(row("Old jazz").getByText("Priority 3")).toBeInTheDocument();
  });

  it("reads each rule out in words, joined the way it matches", () => {
    render(<LibraryRulesCard />);

    expect(row("Ana's music").getByText("Requested by is Ana")).toBeInTheDocument();
    expect(row("Soundtracks").getByText("Genre contains Soundtrack or Artist is Hans Zimmer")).toBeInTheDocument();
    expect(row("Old jazz").getByText("Release year before 1970 and Quality requested is Lossless")).toBeInTheDocument();
  });

  it("names the path that uses a rule, and says when none does", () => {
    render(<LibraryRulesCard />);

    expect(row("Ana's music").getByText("Archive")).toBeInTheDocument();
    expect(row("Soundtracks").getByText(enSettings.libraryRules.notUsed)).toBeInTheDocument();
  });

  it("moves a rule down by sending the whole new order", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: "Move Ana's music down" }));

    expect(state.reorder).toHaveBeenCalledWith({ ids: ["rule-ost", "rule-ana", "rule-jazz"] });
  });

  it("moves a rule up by sending the whole new order", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: "Move Old jazz up" }));

    expect(state.reorder).toHaveBeenCalledWith({ ids: ["rule-ana", "rule-jazz", "rule-ost"] });
  });

  it("cannot move the first rule up or the last one down", () => {
    render(<LibraryRulesCard />);

    expect(screen.getByRole("button", { name: "Move Ana's music up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move Old jazz down" })).toBeDisabled();
  });

  it("says where music goes when there are no rules", () => {
    state.rules = createMockQuery([]);

    render(<LibraryRulesCard />);

    expect(screen.getByText(enSettings.libraryRules.empty)).toBeInTheDocument();
  });

  it("deletes a rule after asking, and says which path stops using it", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: "Delete Ana's music" }));

    expect(screen.getByText("Archive stops using it. Nothing already in the library moves.")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.deleteConfirm.yes }));
    expect(state.remove).toHaveBeenCalledWith({ id: "rule-ana" });
  });
});

describe("creating a rule", () => {
  it("creates it with a name, a match and its conditions, and no path", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.add }));
    await user.type(screen.getByLabelText(enSettings.libraryRules.modal.name), "Film scores");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "Soundtrack");
    await user.click(screen.getByRole("radio", { name: enSettings.libraryRules.modal.matchAny }));
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.modal.add }));

    expect(state.create).toHaveBeenCalledTimes(1);
    const [input] = state.create.mock.calls[0] ?? [];
    expect(input).toEqual({
      name: "Film scores",
      matchMode: "any",
      conditions: [{ field: "genre", op: "contains", value: "Soundtrack" }],
    });
  });

  it("says the path is picked from the path's own settings", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.add }));

    expect(screen.getByText(enSettings.libraryRules.modal.pathNote)).toBeInTheDocument();
  });

  it("keeps the form open when the name is taken", async () => {
    const user = userEvent.setup();
    state.writeResult = { outcome: "name_taken" };
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.add }));
    await user.type(screen.getByLabelText(enSettings.libraryRules.modal.name), "Old jazz");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "Jazz");
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.modal.add }));

    expect(screen.getByText(enSettings.libraryRules.modal.nameTaken)).toBeInTheDocument();
  });

  it("will not save a condition left empty", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.add }));
    await user.type(screen.getByLabelText(enSettings.libraryRules.modal.name), "Empty");

    expect(screen.getByRole("button", { name: enSettings.libraryRules.modal.add })).toBeDisabled();
  });
});

describe("the condition editor", () => {
  async function openNew(user: ReturnType<typeof userEvent.setup>) {
    render(<LibraryRulesCard />);
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.add }));
    await user.type(screen.getByLabelText(enSettings.libraryRules.modal.name), "Rule");
  }

  async function saved(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.modal.add }));
    const [input] = state.create.mock.calls[0] ?? [];
    return input;
  }

  it("picks a member for requested by, from the members list", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Requested by");
    await pick(user, "Condition 1, how to compare", "is not");
    await pick(user, "Condition 1, value", "Leo");

    expect(await saved(user)).toMatchObject({
      conditions: [{ field: "requested_by", op: "is_not", value: "user-leo" }],
    });
  });

  it("offers the three ways to match an artist", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Artist");
    await user.click(screen.getByRole("button", { name: "Condition 1, how to compare" }));

    const options = (await screen.findAllByRole("menuitemradio")).map((option) => option.textContent);
    expect(options).toEqual(["is", "contains", "is not"]);
  });

  it("offers only lossless or lossy for quality", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Quality requested");
    await pick(user, "Condition 1, value", "Lossy");

    expect(await saved(user)).toMatchObject({ conditions: [{ field: "quality", op: "is", value: "lossy" }] });
  });

  it("sends a release year as a number", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Release year");
    await pick(user, "Condition 1, how to compare", "after");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "1999");

    expect(await saved(user)).toMatchObject({ conditions: [{ field: "year", op: "after", value: 1999 }] });
  });

  it("refuses a year that is not a whole year", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Release year");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "19.5");

    expect(screen.getByRole("button", { name: enSettings.libraryRules.modal.add })).toBeDisabled();
  });

  it("picks the kind of request for request type", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Request type");
    await pick(user, "Condition 1, value", "Playlist");

    expect(await saved(user)).toMatchObject({ conditions: [{ field: "request_type", op: "is", value: "playlist" }] });
  });

  it("sends a number of songs as a number", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, what to look at", "Number of songs");
    await pick(user, "Condition 1, how to compare", "fewer than");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "5");

    expect(await saved(user)).toMatchObject({ conditions: [{ field: "track_count", op: "fewer_than", value: 5 }] });
  });

  it("matches a genre that does not contain a word", async () => {
    const user = userEvent.setup();
    await openNew(user);

    await pick(user, "Condition 1, how to compare", "does not contain");
    await user.type(screen.getByRole("textbox", { name: "Condition 1, value" }), "Live");

    expect(await saved(user)).toMatchObject({
      conditions: [{ field: "genre", op: "not_contains", value: "Live" }],
    });
  });

  it("adds and removes conditions, and never leaves a rule with none", async () => {
    const user = userEvent.setup();
    await openNew(user);

    expect(screen.getByRole("button", { name: "Remove condition 1" })).toBeDisabled();
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.modal.addCondition }));
    expect(screen.getByRole("button", { name: "Remove condition 2" })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: "Remove condition 1" }));

    expect(screen.queryByRole("button", { name: "Remove condition 2" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Condition 1, what to look at" })).toHaveTextContent("Quality requested");
  });

  it("stops at twelve conditions", async () => {
    const user = userEvent.setup();
    await openNew(user);

    const add = screen.getByRole("button", { name: enSettings.libraryRules.modal.addCondition });
    for (let count = 1; count < 12; count += 1) await user.click(add);

    expect(screen.getByRole("button", { name: "Remove condition 12" })).toBeInTheDocument();
    expect(add).toBeDisabled();
  });

  it("edits an existing rule with its conditions already filled in", async () => {
    const user = userEvent.setup();
    render(<LibraryRulesCard />);

    await user.click(screen.getByRole("button", { name: "Edit Old jazz" }));
    expect(screen.getByRole("textbox", { name: "Condition 1, value" })).toHaveValue("1970");
    await user.click(screen.getByRole("button", { name: enSettings.libraryRules.modal.save }));

    expect(state.update).toHaveBeenCalledWith(
      {
        id: "rule-jazz",
        name: "Old jazz",
        matchMode: "all",
        conditions: [
          { field: "year", op: "before", value: 1970 },
          { field: "quality", op: "is", value: "lossless" },
        ],
      },
      expect.anything()
    );
  });
});
