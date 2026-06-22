import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { ARCHIVE_FILENAME, ARCHIVE_URL } from "../constants";

const triggerDownload = vi.fn().mockResolvedValue(undefined);

vi.mock("@utils/download", () => ({
  triggerDownload: (url: string, filename: string) => triggerDownload(url, filename),
}));

import { LogExportCard } from "../LogExportCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("LogExportCard", () => {
  it("renders the export card title and the download action", () => {
    render(<LogExportCard />);
    expect(screen.getByText(enSettings.logs.export.title)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: enSettings.logs.export.download })).toBeInTheDocument();
  });

  it("requests the archive download with the configured url and filename", async () => {
    render(<LogExportCard />);
    await userEvent.click(screen.getByRole("button", { name: enSettings.logs.export.download }));
    await waitFor(() => {
      expect(triggerDownload).toHaveBeenCalledWith(ARCHIVE_URL, ARCHIVE_FILENAME);
    });
  });

  it("re-enables the button after the download settles", async () => {
    render(<LogExportCard />);
    const button = screen.getByRole("button", { name: enSettings.logs.export.download });
    await userEvent.click(button);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: enSettings.logs.export.download })).not.toBeDisabled();
    });
  });
});
