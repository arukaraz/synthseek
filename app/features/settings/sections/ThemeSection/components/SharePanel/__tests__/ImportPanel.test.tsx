import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { colorOf, makeDraft, makeEditor, tokenFile } from "../../../__tests__/fixtures";
import { ImportPanel } from "../ImportPanel";

const toastSuccess = vi.fn();
const toastError = vi.fn();
const asked = vi.fn();
let verdict: unknown;

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@hooks/api/mutations/theme", () => ({
  useCheckThemeImport: () => ({
    isPending: false,
    mutate: (input: unknown, options: { onSuccess: (result: unknown) => void }) => {
      asked(input);
      options.onSuccess(verdict);
    },
  }),
}));

const accepted = {
  ok: true,
  name: "Sunset",
  scheme: "light",
  startedFrom: "ocean",
  follows: ["--color-primary-400"],
  files: [
    { path: "tokens/brand.css", text: tokenFile("--color-primary-500", colorOf(0.7, 0.2, 40)) },
    { path: "components/nav.css", text: '[data-part="top-header"] {\n  opacity: 0.9;\n}\n' },
  ],
  tokenCount: 3,
  freeCssFiles: ["components/nav.css"],
  removedResources: 2,
};

const own = makeDraft(
  { name: "Mine" },
  { "tokens/brand.css": tokenFile("--color-primary-500", colorOf(0.5, 0.1, 100)), "custom.css": "/* mine */" }
);

beforeEach(() => {
  verdict = accepted;
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

async function typeAndCheck(text = '{"synthseek":"theme"}') {
  const field = screen.getByRole("textbox", { name: "Theme document to import" });
  fireEvent.change(field, { target: { value: text } });
  await userEvent.click(screen.getByRole("button", { name: "Check" }));
}

describe("ImportPanel", () => {
  it("keeps Check and Apply off until there is something to check", () => {
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Check" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Apply to draft" })).toBeDisabled();
  });

  it("sends the pasted text to be checked", async () => {
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck("{ pasted }");

    expect(asked).toHaveBeenCalledWith({ document: "{ pasted }" });
  });

  it("describes what a good document carries before anything changes", async () => {
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck();

    expect(screen.getByText("Sunset, light scheme. Nothing has changed yet.")).toBeInTheDocument();
    expect(screen.getByText(/Sets 3 tokens\. Any token it leaves out keeps the Ocean value\./)).toBeInTheDocument();
    expect(screen.getByText(/Carries free CSS in components\/nav\.css\./)).toBeInTheDocument();
    expect(screen.getByText(/2 remote resources were removed\./)).toBeInTheDocument();
  });

  it("names an unnamed theme", async () => {
    verdict = { ...accepted, name: "", freeCssFiles: [], removedResources: 0 };
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck();

    expect(screen.getByText(/Unnamed theme, light scheme\./)).toBeInTheDocument();
    expect(screen.queryByText(/Carries free CSS/)).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });

  it("applies the checked document to the draft, closes and says it is only a draft", async () => {
    const editor = makeEditor({ draft: own });
    const onClose = vi.fn();
    render(<ImportPanel editor={editor} onClose={onClose} />);

    await typeAndCheck();
    await userEvent.click(screen.getByRole("button", { name: "Apply to draft" }));

    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.meta).toEqual({
      name: "Sunset",
      scheme: "light",
      startedFrom: "ocean",
      follows: ["--color-primary-400"],
    });
    expect(next.files["components/nav.css"]).toBe(accepted.files[1].text);
    expect(editor.save).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(toastSuccess).toHaveBeenCalledWith("Theme loaded as a draft. Save to keep it, Discard to go back to yours.");
  });

  it("leaves the account's free CSS alone when asked for tokens only", async () => {
    const editor = makeEditor({ draft: own });
    render(<ImportPanel editor={editor} onClose={vi.fn()} />);

    await typeAndCheck();
    await userEvent.click(screen.getByRole("checkbox", { name: "Tokens only, leave my free CSS as it is" }));
    await userEvent.click(screen.getByRole("button", { name: "Apply to draft" }));

    const next = vi.mocked(editor.change).mock.calls[0][0];
    expect(next.files["components/nav.css"]).toBeUndefined();
    expect(next.files["custom.css"]).toBe("/* mine */");
    expect(next.files["tokens/brand.css"]).toBe(accepted.files[0].text);
  });

  it("turns Apply off again as soon as the text no longer matches the last check", async () => {
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck();
    expect(screen.getByRole("button", { name: "Apply to draft" })).toBeEnabled();

    fireEvent.change(screen.getByRole("textbox", { name: "Theme document to import" }), {
      target: { value: '{"synthseek":"theme"} ' },
    });

    expect(screen.getByRole("button", { name: "Apply to draft" })).toBeDisabled();
    expect(screen.queryByText(/Nothing has changed yet/)).not.toBeInTheDocument();
  });

  it("refuses a document the server cannot read and keeps Apply off", async () => {
    verdict = { ok: false, reason: "syntax", detail: "custom.css" };
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck();

    expect(screen.getByText("Cannot import.")).toBeInTheDocument();
    expect(screen.getByText(/This theme has a file that does not parse: custom\.css\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Apply to draft" })).toBeDisabled();
  });

  it("gives each refusal its own message", async () => {
    verdict = { ok: false, reason: "notJson", detail: null };
    render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);

    await typeAndCheck();

    expect(screen.getByText(/This is not valid JSON\./)).toBeInTheDocument();
  });

  it("refuses a file over 3 MiB without reading it", async () => {
    const { container } = render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);
    const big = new File(["{}"], "big.json", { type: "application/json" });
    Object.defineProperty(big, "size", { value: 3 * 1024 * 1024 + 1 });
    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("no file input");

    await userEvent.upload(input, big);

    expect(toastError).toHaveBeenCalledWith("This file is too large to be a theme.");
    expect(screen.getByRole("textbox", { name: "Theme document to import" })).toHaveValue("");
  });

  it("reads a chosen .json file into the box", async () => {
    const { container } = render(<ImportPanel editor={makeEditor()} onClose={vi.fn()} />);
    const input = container.querySelector('input[type="file"]');
    if (!(input instanceof HTMLInputElement)) throw new Error("no file input");

    const file = new File(['{"synthseek":"theme"}'], "theme.json", { type: "application/json" });
    Object.defineProperty(file, "text", { value: () => Promise.resolve('{"synthseek":"theme"}') });

    await userEvent.upload(input, file);

    await waitFor(() =>
      expect(screen.getByRole("textbox", { name: "Theme document to import" })).toHaveValue('{"synthseek":"theme"}')
    );
    expect(toastError).not.toHaveBeenCalled();
  });
});
