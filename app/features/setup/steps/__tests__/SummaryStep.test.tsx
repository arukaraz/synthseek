import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import { mockRouter, resetNextMocks } from "@test/mocks/next.mock";
import enSetup from "@modules/i18n/messages/en/setup.json";

import { SummaryStep } from "../SummaryStep";

const state = vi.hoisted(() => ({ progress: undefined as unknown, finish: vi.fn(), finishOptions: vi.fn() }));

vi.mock("@hooks/api/mutations/settings/useFinishWizard", () => ({
  useFinishWizard: (options: unknown) => {
    state.finishOptions(options);
    return { mutateAsync: state.finish, isPending: false };
  },
}));

vi.mock("@hooks/api/queries/setup/useSetupProgress", () => ({
  useSetupProgress: () => ({ data: state.progress }),
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ currentUser: { id: "u1", username: "ana" } }),
}));

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const onGo = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  resetNextMocks();
  state.finish.mockResolvedValue({ ok: true });
  state.progress = {
    questions: [
      { id: "account", outcome: "answered" },
      { id: "media", outcome: "answered" },
      { id: "downloads", outcome: "skipped" },
      { id: "metadata", outcome: null },
    ],
    resumeAt: "summary",
    finished: false,
  };
});

describe("the summary", () => {
  it("reads as ready, not as a fifth question", () => {
    render(<SummaryStep onGo={onGo} />);

    expect(screen.getByRole("heading", { level: 1, name: enSetup.summary.title })).toHaveFocus();
    expect(screen.getByText("All 4 questions done, ready to finish")).toBeInTheDocument();
  });

  it("lists every question with the admin's name and what became of each", () => {
    render(<SummaryStep onGo={onGo} />);

    const rows = screen.getAllByRole("listitem").map((row) => row.textContent);

    expect(rows).toEqual([
      `${enSetup.summary.questions.account}ana`,
      `${enSetup.summary.questions.media}${enSetup.summary.answered}`,
      `${enSetup.summary.questions.downloads}${enSetup.summary.skipped}`,
      `${enSetup.summary.questions.metadata}${enSetup.summary.open}`,
    ]);
  });

  it("renders nothing until the progress is known", () => {
    state.progress = undefined;
    const { container } = render(<SummaryStep onGo={onGo} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("leaving", () => {
  it("goes back to the last question", async () => {
    render(<SummaryStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.actions.back }));

    expect(onGo).toHaveBeenCalledWith("metadata");
  });

  it("tells the server setup is finished before entering the board, even with questions left open", async () => {
    render(<SummaryStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.summary.finish }));

    expect(state.finishOptions).toHaveBeenCalledWith({ silent: true });
    expect(state.finish).toHaveBeenCalledTimes(1);
    expect(mockRouter.replace).toHaveBeenCalledWith("/");
    expect(state.finish.mock.invocationCallOrder[0]).toBeLessThan(mockRouter.replace.mock.invocationCallOrder[0] ?? 0);
  });

  it("stays on the summary with an inline error when the server cannot finish", async () => {
    state.finish.mockRejectedValueOnce(new Error("offline"));
    render(<SummaryStep onGo={onGo} />);

    await userEvent.click(screen.getByRole("button", { name: enSetup.summary.finish }));

    expect(await screen.findByText(enSetup.summary.failed)).toBeInTheDocument();
    expect(mockRouter.replace).not.toHaveBeenCalled();
  });
});
