import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import { MetadataStep } from "../MetadataStep";

const enrichment = {
  lastfmApiKey: "lf",
  lastfmApiSecret: "lfs",
  fanartApiKey: "fa",
  songlinkApiKey: "sl",
  acoustidApiKey: "ac",
  musicbrainzEmail: "",
  discogsToken: "dg",
  bandsintownAppId: "bt",
};

const api = vi.hoisted(() => ({
  record: vi.fn(),
  save: vi.fn(),
  options: vi.fn(),
  settings: { value: undefined as unknown },
}));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: (options: unknown) => {
    api.options(options);
    return { mutateAsync: api.save, isPending: false };
  },
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: api.settings.value }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const emailLabel = enSetup.metadata.label;
const continueName = enSetup.actions.continue;

beforeEach(() => {
  vi.clearAllMocks();
  api.settings.value = { connections: { enrichment } };
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
  api.save.mockResolvedValue({ ok: true });
});

describe("the question", () => {
  it("is the fourth of four, asks for one email and can go back", () => {
    render(<MetadataStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: enSetup.metadata.title })).toHaveFocus();
    expect(screen.getByText("Question 4 of 4")).toBeInTheDocument();
    expect(screen.getByLabelText(emailLabel)).toHaveAttribute("type", "email");
    expect(screen.getByText(enSetup.metadata.hint)).toBeInTheDocument();
    expect(api.options).toHaveBeenCalledWith({ silent: true });
  });

  it("starts from the email already saved", () => {
    api.settings.value = { connections: { enrichment: { ...enrichment, musicbrainzEmail: "me@example.com" } } };
    render(<MetadataStep onGo={onGo} />);

    expect(screen.getByLabelText(emailLabel)).toHaveValue("me@example.com");
  });

  it("goes back to the downloads question without recording", async () => {
    render(<MetadataStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("downloads");
    expect(api.record).not.toHaveBeenCalled();
  });

  it("blocks Continue until the saved settings have loaded, so no key is overwritten with blanks", () => {
    api.settings.value = undefined;
    render(<MetadataStep onGo={onGo} />);

    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();
  });
});

describe("continuing", () => {
  it("keeps every other saved key, writes only the email, records the answer, and moves to the summary", async () => {
    const user = userEvent.setup();
    render(<MetadataStep onGo={onGo} />);

    await user.type(screen.getByLabelText(emailLabel), " me@example.com ");
    await user.click(screen.getByRole("button", { name: continueName }));

    expect(api.save).toHaveBeenCalledWith({ ...enrichment, musicbrainzEmail: "me@example.com" });
    expect(api.record).toHaveBeenCalledWith({ question: "metadata", outcome: "answered" });
    expect(onGo).toHaveBeenCalledWith("summary");
  });

  it("submits with Enter", async () => {
    const user = userEvent.setup();
    render(<MetadataStep onGo={onGo} />);

    await user.type(screen.getByLabelText(emailLabel), "me@example.com{Enter}");

    expect(api.save).toHaveBeenCalledTimes(1);
  });

  it("does not save a malformed email and explains why", async () => {
    const user = userEvent.setup();
    render(<MetadataStep onGo={onGo} />);

    await user.type(screen.getByLabelText(emailLabel), "nope");
    await user.click(screen.getByRole("button", { name: continueName }));

    expect(screen.getByText(enSetup.metadata.emailError)).toBeInTheDocument();
    expect(screen.getByLabelText(emailLabel)).toHaveAttribute("aria-invalid", "true");
    expect(api.save).not.toHaveBeenCalled();
    expect(api.record).not.toHaveBeenCalled();
  });

  it("stays on the question when the settings cannot be saved", async () => {
    api.save.mockRejectedValueOnce(new Error("no"));
    const user = userEvent.setup();
    render(<MetadataStep onGo={onGo} />);

    await user.type(screen.getByLabelText(emailLabel), "me@example.com");
    await user.click(screen.getByRole("button", { name: continueName }));

    expect(await screen.findByText(enSetup.metadata.saveFailed)).toBeInTheDocument();
    expect(api.record).not.toHaveBeenCalled();
    expect(onGo).not.toHaveBeenCalled();
  });

  it("stays on the question when the answer cannot be recorded", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    const user = userEvent.setup();
    render(<MetadataStep onGo={onGo} />);

    await user.type(screen.getByLabelText(emailLabel), "me@example.com");
    await user.click(screen.getByRole("button", { name: continueName }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onGo).not.toHaveBeenCalled();
  });
});

describe("skipping", () => {
  it("records a skip, writes nothing, and moves to the summary", async () => {
    render(<MetadataStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "metadata", outcome: "skipped" });
    expect(api.save).not.toHaveBeenCalled();
    expect(onGo).toHaveBeenCalledWith("summary");
  });
});
