import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";

import type { WhatsNewEntry } from "../types";
import { makeWhatsNewEntry } from "./fixtures";

type WhatsNewData = { entry: WhatsNewEntry | null; pending: boolean };

let whatsNewQuery: MockQueryResult<WhatsNewData | undefined> = createMockQuery<WhatsNewData | undefined>(undefined);
const mutate = vi.fn();

vi.mock("@hooks/api/queries/useWhatsNew", () => ({
  useWhatsNew: () => whatsNewQuery,
}));

vi.mock("@hooks/api/mutations/updates/useDismissWhatsNew", () => ({
  useDismissWhatsNew: () => ({ mutate }),
}));

import { WhatsNewGate } from "../WhatsNewGate";

const copy = enSettings.updates.whatsNew;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.clearAllMocks();
  document.body.innerHTML = "";
  whatsNewQuery = createMockQuery<WhatsNewData | undefined>(undefined);
});

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

describe("WhatsNewGate", () => {
  it("opens a pending announcement once the app has settled", () => {
    whatsNewQuery = createMockQuery<WhatsNewData | undefined>({ entry: makeWhatsNewEntry(), pending: true });
    render(<WhatsNewGate />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    advance(1200);
    expect(screen.getByRole("heading", { name: copy.heading })).toBeInTheDocument();
  });

  it("stays closed when the announcement was already seen", () => {
    whatsNewQuery = createMockQuery<WhatsNewData | undefined>({ entry: makeWhatsNewEntry(), pending: false });
    render(<WhatsNewGate />);

    advance(10_000);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("waits while another dialog is open", () => {
    const other = document.createElement("div");
    other.setAttribute("role", "dialog");
    other.setAttribute("data-state", "open");
    document.body.appendChild(other);
    whatsNewQuery = createMockQuery<WhatsNewData | undefined>({ entry: makeWhatsNewEntry(), pending: true });
    render(<WhatsNewGate />);

    advance(5000);
    expect(screen.queryByRole("heading", { name: copy.heading })).not.toBeInTheDocument();

    other.setAttribute("data-state", "closed");
    advance(2000);
    expect(screen.getByRole("heading", { name: copy.heading })).toBeInTheDocument();
  });

  it("records the version when closed and does not reopen", () => {
    whatsNewQuery = createMockQuery<WhatsNewData | undefined>({ entry: makeWhatsNewEntry(), pending: true });
    render(<WhatsNewGate />);
    advance(1200);

    fireEvent.click(screen.getByRole("button", { name: "Go to 3 of 3" }));
    fireEvent.click(screen.getByRole("button", { name: copy.done }));

    expect(mutate).toHaveBeenCalledWith({ version: "3.0.0" });
    advance(10_000);
    expect(screen.queryByRole("heading", { name: copy.heading })).not.toBeInTheDocument();
  });
});
