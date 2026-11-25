import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import type { ComponentProps } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enTheme from "@modules/i18n/messages/en/theme.json";
import enThemeEditor from "@modules/i18n/messages/en/themeEditor.json";
import { draftValues, presetValues, resetToken, setToken } from "@theme/custom";
import type { ThemeDraft } from "@theme/custom";

import { DEFAULT_EDITOR_VIEW } from "../../../constants";
import type { EditorView, ThemeFontList } from "../../../types";
import { SECTION_TOKENS } from "../constants";
import { fontStackOf } from "../helpers";
import { VisualMode } from "../VisualMode";
import { ALL_FOLLOWS, LIME, makeDraft, makeEditor, MID_GRAY, PICKED_HEX, pickedWithOpacity } from "./fixtures";

const mocks = vi.hoisted(() => ({
  fonts: { current: undefined as ThemeFontList | undefined },
  upload: vi.fn(),
  remove: vi.fn(),
  renders: new Map<string, number>(),
}));

vi.mock("../ColorRow", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../ColorRow")>();
  return {
    ColorRow: (props: ComponentProps<typeof actual.ColorRow>) => {
      mocks.renders.set(props.token.name, (mocks.renders.get(props.token.name) ?? 0) + 1);
      return actual.ColorRow(props);
    },
  };
});

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFonts: () => ({ data: mocks.fonts.current }),
}));

vi.mock("@hooks/api/mutations/theme", () => ({
  useUploadThemeFont: () => ({ upload: mocks.upload, isUploading: false }),
  useRemoveThemeFont: () => ({ mutate: mocks.remove }),
}));

const factory = presetValues("dark");
const tokens = enTheme.tokens;
const visual = enThemeEditor.visual;

interface HarnessProps {
  draft?: ThemeDraft;
  saved?: ThemeDraft;
  view?: Partial<EditorView>;
  change?: (draft: ThemeDraft) => void;
  setView?: (patch: Partial<EditorView>) => void;
}

function Harness({ draft = makeDraft(), saved = draft, view = {}, change, setView }: HarnessProps) {
  const [current, setCurrent] = useState(draft);
  const [shown, setShown] = useState<EditorView>({ ...DEFAULT_EDITOR_VIEW, ...view });
  const editor = makeEditor({
    draft: current,
    saved,
    view: shown,
    change: (next) => {
      change?.(next);
      setCurrent(next);
    },
    setView: (patch) => {
      setView?.(patch);
      setShown((before) => ({ ...before, ...patch }));
    },
  });
  return <VisualMode editor={editor} />;
}

function rowOf(container: HTMLElement, name: string): HTMLElement {
  const row = container.querySelector<HTMLElement>(`[data-token="${name}"]`);
  if (row === null) throw new Error(`no row for ${name}`);
  return row;
}

function colorInputOf(row: HTMLElement): HTMLInputElement {
  const input = row.querySelector<HTMLInputElement>('input[type="color"]');
  if (input === null) throw new Error("no color input");
  return input;
}

function lastDraft(change: ReturnType<typeof vi.fn>): ThemeDraft {
  const calls = change.mock.calls;
  return calls[calls.length - 1][0];
}

function rowCount(container: HTMLElement): number {
  return container.querySelectorAll("[data-token]").length;
}

beforeEach(() => {
  mocks.fonts.current = undefined;
  mocks.upload.mockReset();
  mocks.remove.mockReset();
});

describe("VisualMode sections", () => {
  it("lists the ten sections of the contract and marks the current one", () => {
    render(<Harness />);

    const nav = screen.getByRole("navigation", { name: visual.sections });
    const buttons = within(nav).getAllByRole("button");

    expect(buttons.map((button) => button.textContent)).toEqual(Object.values(enTheme.sections));
    expect(buttons).toHaveLength(10);
    expect(screen.getByRole("button", { name: enTheme.sections.brand })).toHaveAttribute("aria-current", "true");
    expect(screen.getByRole("button", { name: enTheme.sections.surfaces })).not.toHaveAttribute("aria-current");
  });

  it("asks the editor to change section when one is picked", async () => {
    const setView = vi.fn();
    render(<Harness setView={setView} />);

    await userEvent.click(screen.getByRole("button", { name: enTheme.sections.shape }));

    expect(setView).toHaveBeenCalledWith({ section: "shape" });
    expect(rowOf(document.body, "--radius")).toBeInTheDocument();
  });

  it("dots only the sections whose values differ from the saved theme", () => {
    const saved = makeDraft();
    render(<Harness saved={saved} draft={setToken(saved, "--radius", "0.75rem")} />);

    const dotted = (name: string) =>
      within(screen.getByRole("button", { name: new RegExp(name) })).queryByText(enThemeEditor.bar.unsaved);

    expect(dotted(enTheme.sections.shape)).toBeInTheDocument();
    expect(dotted(enTheme.sections.brand)).not.toBeInTheDocument();
  });
});

describe("VisualMode essentials and Show all", () => {
  const hidden = "--color-primary-700";
  const brandTotal = SECTION_TOKENS.get("brand")?.length ?? 0;
  const withHiddenChange = () => makeDraft(ALL_FOLLOWS.filter((name) => name !== hidden));

  it("lists the essentials of a section and offers every token behind Show all", async () => {
    const { container } = render(<Harness />);

    expect(rowCount(container)).toBe(3);
    await userEvent.click(screen.getByRole("button", { name: `Show all ${brandTotal}` }));

    expect(rowCount(container)).toBe(brandTotal);
    expect(screen.getByRole("button", { name: visual.showEssentials })).toBeInTheDocument();
  });

  it("shows no toggle for a section whose tokens are all essential or none is", () => {
    render(<Harness view={{ section: "content-types", file: "tokens/content-types.css" }} />);

    expect(screen.queryByRole("button", { name: /Show all/ })).not.toBeInTheDocument();
  });

  it("dots Show all while a hidden token differs from the preset, and drops the dot once expanded", async () => {
    render(<Harness draft={withHiddenChange()} />);

    expect(screen.getByRole("img", { name: visual.hiddenChange })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: new RegExp(`Show all ${brandTotal}`) }));
    expect(screen.queryByRole("img", { name: visual.hiddenChange })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: visual.showEssentials }));
    expect(screen.getByRole("img", { name: visual.hiddenChange })).toBeInTheDocument();
  });

  it("does not dot Show all for a change that is visible, or when nothing differs", () => {
    const { unmount } = render(<Harness />);
    expect(screen.queryByRole("img", { name: visual.hiddenChange })).not.toBeInTheDocument();
    unmount();

    render(<Harness draft={setToken(makeDraft(), "--color-primary-500", PICKED_HEX)} />);
    expect(screen.queryByRole("img", { name: visual.hiddenChange })).not.toBeInTheDocument();
  });
});

describe("VisualMode search", () => {
  it("lists matching tokens of every section and hides the section logic", async () => {
    const { container } = render(
      <Harness draft={makeDraft(ALL_FOLLOWS.filter((name) => name !== "--color-primary-700"))} />
    );

    await userEvent.type(screen.getByRole("searchbox", { name: visual.search }), "page background");

    expect(rowCount(container)).toBe(2);
    expect(rowOf(container, "--surface-bg")).toBeInTheDocument();
    expect(rowOf(container, "--backdrop-grid")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Show all/ })).not.toBeInTheDocument();
    expect(screen.queryByRole("img", { name: visual.hiddenChange })).not.toBeInTheDocument();
  });

  it("matches the hint and the token name without regard to case", async () => {
    const { container } = render(<Harness />);
    const box = screen.getByRole("searchbox", { name: visual.search });

    await userEvent.type(box, "FAINT GRID");
    expect(rowOf(container, "--backdrop-grid")).toBeInTheDocument();

    await userEvent.clear(box);
    await userEvent.type(box, "--tracking-caps");
    expect(rowCount(container)).toBe(2);
  });

  it("says so when nothing matches, and returns to the section when cleared", async () => {
    const { container } = render(<Harness />);
    const box = screen.getByRole("searchbox", { name: visual.search });

    await userEvent.type(box, "zzzz");
    expect(screen.getByText(visual.noMatch)).toBeInTheDocument();
    expect(rowCount(container)).toBe(0);

    await userEvent.clear(box);
    expect(rowCount(container)).toBe(3);
  });
});

describe("VisualMode color rows", () => {
  it("writes the picked color as OKLCH", () => {
    const change = vi.fn();
    const { container } = render(<Harness change={change} />);

    fireEvent.input(colorInputOf(rowOf(container, "--color-primary-500")), { target: { value: PICKED_HEX } });

    expect(draftValues(lastDraft(change)).get("--color-primary-500")).toBe(pickedWithOpacity(1));
  });

  it("keeps the opacity of a translucent token when a color is picked", () => {
    const change = vi.fn();
    const { container } = render(<Harness change={change} view={{ section: "surfaces", showAll: true }} />);
    const row = rowOf(container, "--glass-bg");

    expect(within(row).getByText(/40% opaque/)).toBeInTheDocument();
    fireEvent.input(colorInputOf(row), { target: { value: PICKED_HEX } });

    expect(draftValues(lastDraft(change)).get("--glass-bg")).toBe(pickedWithOpacity(0.4));
  });

  it("shows the hex of the value with the swatch titled by the token name", () => {
    const { container } = render(<Harness />);
    const row = rowOf(container, "--color-primary-500");

    expect(row.querySelector("label")).toHaveAttribute("title", "--color-primary-500");
    expect(within(row).getByText(tokens["--color-primary-500"].label)).toBeInTheDocument();
    expect(within(row).getByText(tokens["--color-primary-500"].hint)).toBeInTheDocument();
    expect(within(row).getByText(/^#[0-9a-f]{6}$/)).toBeInTheDocument();
  });

  it("offers to edit in CSS a value it cannot read, and switches the view to that file", async () => {
    const setView = vi.fn();
    const draft = makeDraft(ALL_FOLLOWS, {
      "tokens/surfaces.css": ":root {\n  --surface-bg: color-mix(in oklab, currentColor 50%, transparent);\n}\n",
    });
    const { container } = render(<Harness draft={draft} view={{ section: "surfaces" }} setView={setView} />);
    const row = rowOf(container, "--surface-bg");

    expect(row.querySelector('input[type="color"]')).toBeNull();
    await userEvent.click(within(row).getByRole("button", { name: visual.customValue }));

    expect(setView).toHaveBeenCalledWith({ mode: "css", file: "tokens/surfaces.css" });
  });

  it("badges the contrast against the background and warns below the minimum", () => {
    const readable = render(<Harness view={{ section: "text" }} />);
    const badge = within(rowOf(readable.container, "--surface-fg")).getByTitle(visual.contrast);

    expect(badge.textContent).toMatch(/^\d+\.\d:1$/);
    expect(Number.parseFloat(badge.textContent ?? "0")).toBeGreaterThanOrEqual(4.5);
    expect(badge).not.toHaveClass("text-warning-vivid");
    readable.unmount();

    const background = draftValues(makeDraft()).get("--surface-bg") ?? "";
    const flat = render(
      <Harness draft={setToken(makeDraft(), "--surface-fg", background)} view={{ section: "text" }} />
    );
    const warned = within(rowOf(flat.container, "--surface-fg")).getByTitle(visual.contrast);

    expect(warned).toHaveTextContent("1.0:1");
    expect(warned).toHaveClass("text-warning-vivid");
  });

  it("warns in the row of a color its text can no longer be read on, in place of the hint", () => {
    const readable = render(<Harness />);
    const calm = rowOf(readable.container, "--color-primary-500");

    expect(within(calm).getByText(tokens["--color-primary-500"].hint)).toBeInTheDocument();
    expect(within(calm).queryByText(/is hard to read on this color/)).not.toBeInTheDocument();
    readable.unmount();

    const lime = render(<Harness draft={setToken(makeDraft(), "--color-primary-500", LIME)} />);
    const row = rowOf(lime.container, "--color-primary-500");
    const warning = within(row).getByText(/^Text on primary is hard to read on this color \(1\.\d:1\)\.$/);

    expect(warning).toHaveClass("text-warning-vivid");
    expect(warning).not.toHaveClass("line-clamp-2");
    expect(within(row).queryByText(tokens["--color-primary-500"].hint)).not.toBeInTheDocument();
    expect(within(rowOf(lime.container, "--color-secondary-500")).queryByText(/is hard to read/)).toBeNull();
  });

  it("warns in the page background row when the text on it cannot be read", () => {
    const draft = setToken(makeDraft(), "--surface-bg", MID_GRAY);
    const { container } = render(<Harness draft={draft} view={{ section: "surfaces" }} />);

    expect(
      within(rowOf(container, "--surface-bg")).getByText(/^Secondary text is hard to read on this color/)
    ).toBeInTheDocument();
  });

  it("shows no contrast badge for a token drawn on nothing", () => {
    const { container } = render(<Harness view={{ section: "surfaces", showAll: true }} />);

    expect(within(rowOf(container, "--surface-bg-elevated")).queryByTitle(visual.contrast)).not.toBeInTheDocument();
  });
});

describe("VisualMode follow behaviour", () => {
  const follower = "--color-primary-600";
  const hint = tokens[follower].hint;
  const base = tokens["--color-primary-500"].label;

  it("says a step follows its base until it is set by hand, then says so", () => {
    const { container } = render(<Harness view={{ showAll: true }} />);
    const row = rowOf(container, follower);

    expect(within(row).getByText(`Follows ${base}. Pick a color to set it yourself`)).toBeInTheDocument();
    fireEvent.input(colorInputOf(row), { target: { value: PICKED_HEX } });

    expect(within(row).getByText(`Set by hand. ${hint}`)).toBeInTheDocument();
    expect(within(row).queryByText(/^Follows/)).not.toBeInTheDocument();
  });

  it("follows again after the reset dot is pressed", async () => {
    const draft = setToken(makeDraft(), follower, PICKED_HEX);
    const { container } = render(<Harness draft={draft} view={{ showAll: true }} />);
    const row = rowOf(container, follower);

    expect(within(row).getByText(`Set by hand. ${hint}`)).toBeInTheDocument();
    await userEvent.click(within(row).getByRole("button", { name: `Follow ${base} again` }));

    expect(within(row).getByText(`Follows ${base}. Pick a color to set it yourself`)).toBeInTheDocument();
  });
});

describe("VisualMode number and length rows", () => {
  const radius = tokens["--radius"].label;

  it("writes the slider position followed by the unit of the token", () => {
    const change = vi.fn();
    render(<Harness change={change} view={{ section: "shape" }} />);

    fireEvent.change(screen.getByRole("slider", { name: radius }), { target: { value: "0.75" } });

    expect(draftValues(lastDraft(change)).get("--radius")).toBe("0.75rem");
  });

  it("writes a unitless number as it is", () => {
    const change = vi.fn();
    render(<Harness change={change} view={{ section: "typography" }} />);

    fireEvent.change(screen.getByRole("slider", { name: tokens["--ui-scale"].label }), { target: { value: "1.1" } });

    expect(draftValues(lastDraft(change)).get("--ui-scale")).toBe("1.1");
  });

  it("gives the slider the bounds of the contract and shows the value as written", () => {
    render(<Harness view={{ section: "shape" }} />);
    const slider = screen.getByRole("slider", { name: radius });

    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "1.125");
    expect(slider).toHaveAttribute("step", "0.0625");
    expect(slider).toHaveValue("0.5");
    expect(screen.getByText("0.5rem")).toBeInTheDocument();
  });

  it("replaces the slider with the custom marker and the CSS link for a value it cannot read", async () => {
    const setView = vi.fn();
    const draft = makeDraft(ALL_FOLLOWS, { "tokens/shape.css": ":root {\n  --radius: calc(var(--x) * 2);\n}\n" });
    render(<Harness draft={draft} view={{ section: "shape" }} setView={setView} />);

    expect(screen.queryByRole("slider", { name: radius })).not.toBeInTheDocument();
    expect(screen.getByText(visual.customNumber)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: visual.customValue }));

    expect(setView).toHaveBeenCalledWith({ mode: "css", file: "tokens/shape.css" });
  });
});

describe("VisualMode reset dot", () => {
  const radius = tokens["--radius"].label;

  it("is disabled for a token that matches the preset", () => {
    render(<Harness view={{ section: "shape" }} />);

    expect(screen.getByRole("button", { name: `Reset ${radius}` })).toBeDisabled();
  });

  it("is enabled for a changed token, titled with the preset, and puts the preset value back", async () => {
    const change = vi.fn();
    render(
      <Harness draft={setToken(makeDraft(), "--radius", "0.75rem")} change={change} view={{ section: "shape" }} />
    );
    const dot = screen.getByRole("button", { name: `Reset ${radius}` });

    expect(dot).toBeEnabled();
    expect(dot).toHaveAttribute("title", `Back to the ${enThemeEditor.presets.dark} value`);
    await userEvent.click(dot);

    expect(draftValues(lastDraft(change)).get("--radius")).toBe(factory["--radius"]);
    expect(dot).toBeDisabled();
  });

  it("is named after the base for a token that follows another, and enabled once set by hand", async () => {
    const draft = setToken(makeDraft(), "--color-primary-600", PICKED_HEX);
    const change = vi.fn();
    const { container } = render(<Harness draft={draft} change={change} view={{ showAll: true }} />);
    const dot = within(rowOf(container, "--color-primary-600")).getByRole("button", {
      name: `Follow ${tokens["--color-primary-500"].label} again`,
    });

    expect(dot).toBeEnabled();
    expect(dot).toHaveAttribute("title", `Follow ${tokens["--color-primary-500"].label} again`);
    await userEvent.click(dot);

    expect(lastDraft(change).meta.follows).toContain("--color-primary-600");
    expect(lastDraft(change)).toEqual(resetToken(draft, "--color-primary-600"));
  });

  it("is disabled for a step that is still following", () => {
    const { container } = render(<Harness view={{ showAll: true }} />);
    const dots = within(rowOf(container, "--color-primary-600")).getAllByRole("button", {
      name: `Follow ${tokens["--color-primary-500"].label} again`,
    });

    expect(dots).toHaveLength(1);
    expect(dots[0]).toBeDisabled();
  });
});

describe("VisualMode font rows", () => {
  const sans = tokens["--font-sans"].label;
  const uploaded: ThemeFontList = {
    fonts: [{ file: "Inter.woff2", bytes: 2048, leftOut: false }],
    usedBytes: 2048,
    maxBytes: 5242880,
  };

  it("offers the six stacks and writes the one picked", async () => {
    const change = vi.fn();
    render(<Harness change={change} view={{ section: "typography" }} />);

    await userEvent.click(screen.getByRole("button", { name: sans }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(6);
    await userEvent.click(screen.getByRole("menuitemradio", { name: enThemeEditor.fonts.serif }));

    expect(draftValues(lastDraft(change)).get("--font-sans")).toContain("Charter");
  });

  it("adds an option per uploaded font that writes its family before the factory stack", async () => {
    mocks.fonts.current = uploaded;
    const change = vi.fn();
    render(<Harness change={change} view={{ section: "typography" }} />);

    await userEvent.click(screen.getByRole("button", { name: sans }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(7);
    await userEvent.click(screen.getByRole("menuitemradio", { name: "Inter" }));

    expect(draftValues(lastDraft(change)).get("--font-sans")).toBe(fontStackOf("--font-sans", "Inter"));
  });

  it("shows the factory stack as System and an extra Custom value option for a stack it does not list", async () => {
    const { unmount } = render(<Harness view={{ section: "typography" }} />);
    expect(screen.getByRole("button", { name: sans })).toHaveTextContent(enThemeEditor.fonts.system);
    unmount();

    const draft = makeDraft(ALL_FOLLOWS, { "tokens/typography.css": ":root {\n  --font-sans: Papyrus, fantasy;\n}\n" });
    render(<Harness draft={draft} view={{ section: "typography" }} />);
    expect(screen.getByRole("button", { name: sans })).toHaveTextContent(visual.customOption);

    await userEvent.click(screen.getByRole("button", { name: sans }));
    expect(screen.getAllByRole("menuitemradio")).toHaveLength(7);
  });

  it("offers the three mono stacks", async () => {
    render(<Harness view={{ section: "typography", showAll: true }} />);

    await userEvent.click(screen.getByRole("button", { name: tokens["--font-mono"].label }));

    expect(screen.getAllByRole("menuitemradio").map((item) => item.textContent)).toEqual([
      enThemeEditor.fonts.systemMono,
      enThemeEditor.fonts.courier,
      enThemeEditor.fonts.sameAsInterface,
    ]);
  });
});

describe("VisualMode font upload block", () => {
  const uploaded: ThemeFontList = {
    fonts: [{ file: "Inter.woff2", bytes: 2048, leftOut: false }],
    usedBytes: 2048,
    maxBytes: 5242880,
  };
  const overTheLimit: ThemeFontList = {
    fonts: [
      { file: "Inter.woff2", bytes: 2048, leftOut: false },
      { file: "Heavy.woff2", bytes: 5242880, leftOut: true },
    ],
    usedBytes: 5244928,
    maxBytes: 5242880,
  };

  it("marks a font the server left out, offers it for no token and still lets it be removed", async () => {
    mocks.fonts.current = overTheLimit;
    render(<Harness view={{ section: "typography" }} />);
    const heavy = screen.getByText("Heavy.woff2").closest("li");
    if (heavy === null) throw new Error("no list item for the font left out");

    expect(within(heavy).getByText(enThemeEditor.fonts.leftOut)).toBeInTheDocument();
    expect(within(heavy).queryByRole("button", { name: "Use Heavy.woff2" })).not.toBeInTheDocument();
    expect(within(heavy).getByRole("button", { name: "Remove Heavy.woff2" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Use Inter.woff2" })).toBeInTheDocument();
    expect(screen.getAllByText(enThemeEditor.fonts.leftOut)).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: tokens["--font-sans"].label }));
    const options = screen.getAllByRole("menuitemradio").map((option) => option.textContent);
    expect(options).toContain("Inter");
    expect(options).not.toContain("Heavy");
  });

  it("shows the upload block and the list in Typography only, and not while searching", async () => {
    mocks.fonts.current = uploaded;
    const typography = render(<Harness view={{ section: "typography" }} />);

    expect(screen.getByText(enThemeEditor.fonts.uploadTitle)).toBeInTheDocument();
    expect(screen.getByText("Inter.woff2")).toBeInTheDocument();
    expect(screen.getByText("2.0 KB of 5.0 MB used")).toBeInTheDocument();

    await userEvent.type(screen.getByRole("searchbox", { name: visual.search }), "font");
    expect(screen.queryByText(enThemeEditor.fonts.uploadTitle)).not.toBeInTheDocument();
    typography.unmount();

    render(<Harness />);
    expect(screen.queryByText(enThemeEditor.fonts.uploadTitle)).not.toBeInTheDocument();
  });

  it("hands the chosen file to the upload", async () => {
    mocks.fonts.current = uploaded;
    mocks.upload.mockResolvedValue(true);
    render(<Harness view={{ section: "typography" }} />);
    const file = new File(["data"], "Brand.woff2", { type: "font/woff2" });

    await userEvent.upload(screen.getByLabelText(enThemeEditor.fonts.uploadTitle, { selector: "input" }), file);

    expect(mocks.upload).toHaveBeenCalledWith(file);
  });

  it("sets the interface font to the uploaded one", async () => {
    mocks.fonts.current = uploaded;
    const change = vi.fn();
    render(<Harness change={change} view={{ section: "typography" }} />);

    await userEvent.click(screen.getByRole("button", { name: "Use Inter.woff2" }));

    expect(draftValues(lastDraft(change)).get("--font-sans")).toBe(fontStackOf("--font-sans", "Inter"));
  });

  it("asks before removing a font", async () => {
    mocks.fonts.current = uploaded;
    render(<Harness view={{ section: "typography" }} />);

    await userEvent.click(screen.getByRole("button", { name: "Remove Inter.woff2" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(mocks.remove).not.toHaveBeenCalled();
  });
});

describe("VisualMode rendering cost", () => {
  it("renders again only the rows a color drag touched", () => {
    mocks.renders.clear();
    const { container } = render(<Harness view={{ showAll: true }} />);
    const rendered = (name: string) => mocks.renders.get(name) ?? 0;

    fireEvent.input(colorInputOf(rowOf(container, "--color-primary-500")), { target: { value: PICKED_HEX } });

    expect(rendered("--color-primary-500")).toBeGreaterThan(1);
    expect(rendered("--color-secondary-500")).toBe(1);
    expect(rendered("--color-accent-500")).toBe(1);
  });
});
