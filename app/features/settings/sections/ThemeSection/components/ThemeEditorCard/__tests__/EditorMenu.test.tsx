import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { colorOf, makeEditor, tokenFile } from "../../../__tests__/fixtures";
import { EditorMenu } from "../EditorMenu";

const fetchPreset = vi.fn();
const errorToast = vi.fn();

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeFetchers: () => ({ preset: fetchPreset }),
}));

vi.mock("@modules/errors", () => ({
  errorToast: (...args: unknown[]) => errorToast(...args),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function openMenu() {
  await userEvent.click(screen.getByRole("button", { name: "Theme options" }));
}

describe("EditorMenu", () => {
  it("opens on click with three rows and no reference row", async () => {
    render(<EditorMenu editor={makeEditor()} panel={null} onShare={vi.fn()} />);

    expect(screen.queryByText("Start from")).not.toBeInTheDocument();
    await openMenu();

    expect(await screen.findByText("Start from")).toBeInTheDocument();
    expect(screen.getByText("Scheme")).toBeInTheDocument();
    expect(screen.getByText("Share")).toBeInTheDocument();
    expect(screen.queryByText("Reference")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("gives every row an info button named for it", async () => {
    render(<EditorMenu editor={makeEditor()} panel={null} onShare={vi.fn()} />);
    await openMenu();

    expect(await screen.findByRole("button", { name: "About Start from" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "About Scheme" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "About Share" })).toBeInTheDocument();
  });

  it("closes on Escape", async () => {
    render(<EditorMenu editor={makeEditor()} panel={null} onShare={vi.fn()} />);
    await openMenu();
    await screen.findByText("Start from");

    await userEvent.keyboard("{Escape}");

    expect(screen.queryByText("Start from")).not.toBeInTheDocument();
  });

  it("does not open an info tooltip by itself when it opens", async () => {
    render(<EditorMenu editor={makeEditor()} panel={null} onShare={vi.fn()} />);
    await openMenu();
    await screen.findByText("Start from");

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("closes on a click outside", async () => {
    render(
      <>
        <button type="button">Elsewhere</button>
        <EditorMenu editor={makeEditor()} panel={null} onShare={vi.fn()} />
      </>
    );
    await openMenu();
    await screen.findByText("Start from");

    await userEvent.click(screen.getByRole("button", { name: "Elsewhere" }));

    expect(screen.queryByText("Start from")).not.toBeInTheDocument();
  });

  it("writes the scheme into the draft's meta", async () => {
    const editor = makeEditor();
    render(<EditorMenu editor={editor} panel={null} onShare={vi.fn()} />);
    await openMenu();

    await userEvent.click(await screen.findByRole("radio", { name: "Light" }));

    expect(editor.change).toHaveBeenCalledWith({ ...editor.draft, meta: { ...editor.draft.meta, scheme: "light" } });
  });

  it("asks to share and closes the menu", async () => {
    const onShare = vi.fn();
    render(<EditorMenu editor={makeEditor()} panel={null} onShare={onShare} />);
    await openMenu();

    await userEvent.click(await screen.findByRole("button", { name: "Import" }));

    expect(onShare).toHaveBeenCalledWith("import");
    expect(screen.queryByText("Start from")).not.toBeInTheDocument();
  });

  it("marks the open panel on its button", async () => {
    render(<EditorMenu editor={makeEditor()} panel="export" onShare={vi.fn()} />);
    await openMenu();

    expect(await screen.findByRole("button", { name: "Export" })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("button", { name: "Import" })).toHaveAttribute("aria-expanded", "false");
  });

  it("replaces the draft with the chosen preset", async () => {
    const preset = {
      files: [{ path: "tokens/brand.css", text: tokenFile("--color-primary-500", colorOf(0.6, 0.2, 250)) }],
      follows: ["--color-primary-400"],
    };
    fetchPreset.mockResolvedValue(preset);
    const editor = makeEditor();
    render(<EditorMenu editor={editor} panel={null} onShare={vi.fn()} />);
    await openMenu();

    await userEvent.click(await screen.findByRole("button", { name: "Start from" }));
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "Ocean" }));

    expect(fetchPreset).toHaveBeenCalledWith("ocean");
    await vi.waitFor(() => expect(editor.change).toHaveBeenCalledTimes(1));
    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.meta.startedFrom).toBe("ocean");
    expect(next.meta.follows).toEqual(["--color-primary-400"]);
    expect(next.files["tokens/brand.css"]).toBe(preset.files[0].text);
  });

  it("reports a preset that could not be fetched and leaves the draft alone", async () => {
    fetchPreset.mockRejectedValue(new Error("offline"));
    const editor = makeEditor();
    render(<EditorMenu editor={editor} panel={null} onShare={vi.fn()} />);
    await openMenu();

    await userEvent.click(await screen.findByRole("button", { name: "Start from" }));
    await userEvent.click(await screen.findByRole("menuitemradio", { name: "Midnight" }));

    await vi.waitFor(() => expect(errorToast).toHaveBeenCalledTimes(1));
    expect(editor.change).not.toHaveBeenCalled();
  });
});
