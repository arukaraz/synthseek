import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { HistoryPanel } from "../components/HistoryPanel";
import { draftOf, editorOf } from "./fixtures";

const api = vi.hoisted(() => ({
  history: { data: undefined as { versions: unknown[] } | undefined },
  version: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("sonner", () => ({ toast: api.toast }));

vi.mock("@hooks/api/queries/theme", () => ({
  useThemeHistory: () => api.history,
  useThemeFetchers: () => ({ version: api.version }),
}));

const PATH = "tokens/brand.css";

function versionOf(id: string, source: string, current = false) {
  return { id, at: "2026-11-01T10:30:00.000Z", source, bytes: 40, current };
}

beforeEach(() => {
  api.history.data = { versions: [] };
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("HistoryPanel", () => {
  it("shows the title, the path and the empty line for a file with no version", () => {
    render(<HistoryPanel editor={editorOf()} path={PATH} generated={false} />);

    expect(screen.getByRole("heading", { name: "History" })).toBeInTheDocument();
    expect(screen.getByText(PATH)).toBeInTheDocument();
    expect(screen.getByText("No version yet.")).toBeInTheDocument();
  });

  it("says theme.json is generated and keeps no versions", () => {
    render(<HistoryPanel editor={editorOf()} path="theme.json" generated />);

    expect(screen.getByText("Written by Synthseek. It keeps no versions.")).toBeInTheDocument();
    expect(screen.queryByText("No version yet.")).toBeNull();
  });

  it("lists each version with its source label and marks the saved one", () => {
    api.history.data = {
      versions: [
        versionOf("a", "settings", true),
        versionOf("b", "volume"),
        versionOf("c", "preset"),
        versionOf("d", "assistant"),
      ],
    };
    render(<HistoryPanel editor={editorOf()} path={PATH} generated={false} />);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getByText("Saved from Settings")).toBeInTheDocument();
    expect(within(rows[0]).getByText("Saved now")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Edited on the server")).toBeInTheDocument();
    expect(within(rows[1]).queryByText("Saved now")).toBeNull();
    expect(within(rows[2]).getByText("Created from a preset")).toBeInTheDocument();
    expect(within(rows[3]).getByText("Written by an assistant")).toBeInTheDocument();
  });

  it("restores a version into the draft through change and never saves", async () => {
    api.history.data = { versions: [versionOf("a", "settings", true), versionOf("b", "volume")] };
    api.version.mockResolvedValue({ text: ":root { --x: 2; }" });
    const editor = editorOf();
    render(<HistoryPanel editor={editor} path={PATH} generated={false} />);

    await userEvent.click(screen.getAllByRole("button", { name: /^Restore the version from/ })[1]);

    await waitFor(() => expect(editor.change).toHaveBeenCalledTimes(1));
    expect(api.version).toHaveBeenCalledWith(PATH, "b");
    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.files[PATH]).toBe(":root { --x: 2; }");
    expect(next.files["tokens/shape.css"]).toBe(editor.draft.files["tokens/shape.css"]);
    expect(editor.save).not.toHaveBeenCalled();
    expect(api.toast.success).toHaveBeenCalledWith("Version loaded into the editor. Save to keep it.");
  });

  it("disables the saved version while the file equals the saved text, and no other", () => {
    api.history.data = { versions: [versionOf("a", "settings", true), versionOf("b", "volume")] };
    render(<HistoryPanel editor={editorOf()} path={PATH} generated={false} />);

    const [current, older] = screen.getAllByRole("button", { name: /^Restore the version from/ });
    expect(current).toBeDisabled();
    expect(older).toBeEnabled();
  });

  it("marks only the newest of the versions that hold the saved text, and disables each of them", () => {
    api.history.data = {
      versions: [versionOf("a", "settings", true), versionOf("b", "volume"), versionOf("c", "settings", true)],
    };
    render(<HistoryPanel editor={editorOf()} path={PATH} generated={false} />);

    const rows = screen.getAllByRole("listitem");
    expect(within(rows[0]).getByText("Saved now")).toBeInTheDocument();
    expect(within(rows[2]).queryByText("Saved now")).toBeNull();
    const [newest, other, older] = screen.getAllByRole("button", { name: /^Restore the version from/ });
    expect(newest).toBeDisabled();
    expect(other).toBeEnabled();
    expect(older).toBeDisabled();
  });

  it("enables the saved version once the file has been edited", () => {
    api.history.data = { versions: [versionOf("a", "settings", true)] };
    const saved = draftOf();
    const draft = draftOf({ [PATH]: ":root { --edited: 1; }" });
    render(<HistoryPanel editor={editorOf({ draft, saved })} path={PATH} generated={false} />);

    expect(screen.getByRole("button", { name: /^Restore the version from/ })).toBeEnabled();
  });

  it("tells the user when a version could not be loaded and changes nothing", async () => {
    api.history.data = { versions: [versionOf("b", "volume")] };
    api.version.mockRejectedValue(new Error("gone"));
    const editor = editorOf();
    render(<HistoryPanel editor={editor} path={PATH} generated={false} />);

    await userEvent.click(screen.getByRole("button", { name: /^Restore the version from/ }));

    await waitFor(() => expect(api.toast.error).toHaveBeenCalledTimes(1));
    expect(editor.change).not.toHaveBeenCalled();
  });
});
