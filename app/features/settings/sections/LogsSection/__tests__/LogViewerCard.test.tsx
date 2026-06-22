import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockQuery, type MockQueryResult } from "@test/mocks/trpc.mock";
import { createMockLogEntry } from "@test/mocks/feature-hooks.mock";
import type { LogTailResult } from "../types";

const sampleData: LogTailResult = {
  file: "synthseek.log",
  entries: [
    createMockLogEntry({ raw: "[INFO] started", level: "INFO" }),
    createMockLogEntry({ raw: "[ERROR] boom", level: "ERROR" }),
  ],
};

let logTailQuery: MockQueryResult<LogTailResult | undefined> = createMockQuery<LogTailResult | undefined>(sampleData);

vi.mock("@hooks/api/queries/useLogTail", () => ({
  useLogTail: () => logTailQuery,
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (msg: string) => toastSuccess(msg),
    error: (msg: string) => toastError(msg),
  },
}));

const downloadText = vi.fn();

vi.mock("@utils/download", () => ({
  downloadText: (filename: string, text: string) => downloadText(filename, text),
}));

import { LogViewerCard } from "../LogViewerCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.localStorage.clear();
  logTailQuery = createMockQuery<LogTailResult | undefined>(sampleData);
});

describe("LogViewerCard", () => {
  it("renders the viewer title and the most recent line", () => {
    render(<LogViewerCard />);
    expect(screen.getByText(enSettings.logs.viewer.title)).toBeInTheDocument();
    expect(screen.getByText("[INFO] started")).toBeInTheDocument();
  });

  it("shows the loading state while the tail loads", () => {
    logTailQuery = createMockQuery<LogTailResult | undefined>(undefined, { isLoading: true });
    render(<LogViewerCard />);
    expect(screen.getByText(enSettings.logs.viewer.loading)).toBeInTheDocument();
  });

  it("shows the error message when the tail query fails", () => {
    logTailQuery = createMockQuery<LogTailResult | undefined>(undefined, {
      isError: true,
      error: new Error("disk gone"),
    });
    render(<LogViewerCard />);
    expect(screen.getByText(/disk gone/)).toBeInTheDocument();
  });

  it("shows the empty state when there are no entries", () => {
    logTailQuery = createMockQuery<LogTailResult | undefined>({ file: "synthseek.log", entries: [] });
    render(<LogViewerCard />);
    expect(screen.getByText(enSettings.logs.viewer.empty)).toBeInTheDocument();
  });

  it("hides entries whose level chip is toggled off", async () => {
    render(<LogViewerCard />);
    expect(screen.getByText("[ERROR] boom")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "ERROR", pressed: true }));

    expect(screen.queryByText("[ERROR] boom")).not.toBeInTheDocument();
    expect(screen.getByText("[INFO] started")).toBeInTheDocument();
  });

  it("restores a level when its chip is toggled off then on again", async () => {
    render(<LogViewerCard />);
    const errorChip = screen.getByRole("button", { name: "ERROR", pressed: true });

    await userEvent.click(errorChip);
    expect(screen.queryByText("[ERROR] boom")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "ERROR", pressed: false }));
    expect(screen.getByText("[ERROR] boom")).toBeInTheDocument();
  });

  it("filters entries by the search needle", async () => {
    render(<LogViewerCard />);
    await userEvent.type(screen.getByPlaceholderText(enSettings.logs.viewer.searchPlaceholder), "boom");

    expect(screen.getByText("[ERROR] boom")).toBeInTheDocument();
    expect(screen.queryByText("[INFO] started")).not.toBeInTheDocument();
  });

  it("copies the displayed lines and toasts success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<LogViewerCard />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.logs.viewer.copy }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith("[ERROR] boom\n[INFO] started");
      expect(toastSuccess).toHaveBeenCalledWith(enSettings.logs.viewer.copied);
    });
  });

  it("toasts an error when the clipboard write fails", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<LogViewerCard />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.logs.viewer.copy }));

    await waitFor(() => {
      expect(toastError).toHaveBeenCalledWith(enSettings.logs.viewer.copyFailed);
    });
  });

  it("disables copy when no entries match the active filters", async () => {
    render(<LogViewerCard />);
    await userEvent.type(screen.getByPlaceholderText(enSettings.logs.viewer.searchPlaceholder), "zzz-no-match");
    expect(screen.getByRole("button", { name: enSettings.logs.viewer.copy })).toBeDisabled();
  });

  it("exports the unfiltered entries on export recent", async () => {
    render(<LogViewerCard />);
    await userEvent.click(screen.getByRole("button", { name: enSettings.logs.viewer.exportRecent }));
    expect(downloadText).toHaveBeenCalledWith("synthseek-recent.log", "[INFO] started\n[ERROR] boom");
  });

  it("disables export recent when there is no data", () => {
    logTailQuery = createMockQuery<LogTailResult | undefined>({ file: "synthseek.log", entries: [] });
    render(<LogViewerCard />);
    expect(screen.getByRole("button", { name: enSettings.logs.viewer.exportRecent })).toBeDisabled();
  });

  it("refetches when the refresh button is pressed", async () => {
    render(<LogViewerCard />);
    await userEvent.click(screen.getByRole("button", { name: enSettings.logs.viewer.refresh }));
    expect(logTailQuery.refetch).toHaveBeenCalledTimes(1);
  });

  it("disables the refresh button while fetching", () => {
    logTailQuery = createMockQuery<LogTailResult | undefined>(sampleData, { isFetching: true });
    render(<LogViewerCard />);
    expect(screen.getByRole("button", { name: enSettings.logs.viewer.refresh })).toBeDisabled();
  });

  it("changes the line count through the segmented control", async () => {
    render(<LogViewerCard />);
    const lines2000 = screen.getByRole("radio", { name: "2000" });
    await userEvent.click(lines2000);
    expect(lines2000).toHaveAttribute("aria-checked", "true");
  });

  it("persists the chosen refresh interval to local storage", async () => {
    render(<LogViewerCard />);
    await userEvent.click(screen.getByRole("radio", { name: enSettings.logs.viewer.refreshOptions.seconds30 }));
    expect(window.localStorage.getItem("synthseek.logs.refreshSeconds")).toBe("30");
  });

  it("selects the off refresh option without scheduling an interval", async () => {
    window.localStorage.setItem("synthseek.logs.refreshSeconds", "0");
    render(<LogViewerCard />);

    await waitFor(() => {
      expect(screen.getByRole("radio", { name: enSettings.logs.viewer.refreshOptions.off })).toHaveAttribute(
        "aria-checked",
        "true"
      );
    });
    expect(screen.getByText("[INFO] started")).toBeInTheDocument();
  });
});
