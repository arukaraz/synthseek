import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import enSetup from "@modules/i18n/messages/en/setup.json";

import { MediaStep } from "../MediaStep";

const api = vi.hoisted(() => ({ record: vi.fn() }));

vi.mock("@hooks/api/mutations/setup/useRecordSetupOutcome", () => ({
  useRecordSetupOutcome: () => ({ mutateAsync: api.record, isPending: false }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();
const continueName = enSetup.actions.continue;

function radio(value: string): HTMLElement {
  const found = screen.getAllByRole("radio").find((candidate) => candidate.getAttribute("value") === value);
  if (!found) throw new Error(`no radio ${value}`);
  return found;
}

beforeEach(() => {
  vi.clearAllMocks();
  api.record.mockResolvedValue({ questions: [], resumeAt: null, finished: false });
});

describe("the question", () => {
  it("offers each media server and none, and has no way back", () => {
    render(<MediaStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: enSetup.media.title })).toHaveFocus();
    expect(screen.getByText("Question 2 of 4")).toBeInTheDocument();
    expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
      "plex",
      "navidrome",
      "jellyfin",
      "none",
    ]);
    expect(screen.queryByRole("button", { name: enSetup.actions.back })).not.toBeInTheDocument();
  });

  it("keeps Continue blocked until something is chosen", async () => {
    render(<MediaStep onGo={onGo} />);
    expect(screen.getByRole("button", { name: continueName })).toBeDisabled();

    await userEvent.click(radio("plex"));

    expect(screen.getByRole("button", { name: continueName })).toBeEnabled();
  });
});

describe("choosing a server", () => {
  it("goes to that server's form and records nothing yet", async () => {
    render(<MediaStep onGo={onGo} />);

    await userEvent.click(radio("navidrome"));
    await userEvent.click(screen.getByRole("button", { name: continueName }));

    expect(onGo).toHaveBeenCalledWith("media", "navidrome");
    expect(api.record).not.toHaveBeenCalled();
  });
});

describe("choosing none", () => {
  it("records the answer first and only then moves to the next question", async () => {
    render(<MediaStep onGo={onGo} />);

    await userEvent.click(radio("none"));
    await userEvent.click(screen.getByRole("button", { name: continueName }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "answered" });
    expect(onGo).toHaveBeenCalledWith("downloads");
    expect(api.record.mock.invocationCallOrder[0]).toBeLessThan(onGo.mock.invocationCallOrder[0] ?? 0);
  });
});

describe("skipping", () => {
  it("records a skip and moves on", async () => {
    render(<MediaStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(api.record).toHaveBeenCalledWith({ question: "media", outcome: "skipped" });
    expect(onGo).toHaveBeenCalledWith("downloads");
  });
});

describe("when the server cannot record the answer", () => {
  it("keeps the visitor on the question with an inline error and does not move on", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    render(<MediaStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(onGo).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { level: 1, name: enSetup.media.title })).toBeInTheDocument();
  });

  it("clears the error on the next attempt", async () => {
    api.record.mockRejectedValueOnce(new Error("offline"));
    render(<MediaStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));
    await screen.findByRole("alert");
    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.skip }));

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(onGo).toHaveBeenCalledWith("downloads");
  });
});
