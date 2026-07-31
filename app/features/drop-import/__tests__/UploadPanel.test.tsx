import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { DropImportUploadResult } from "@hooks/api";

const spies = vi.hoisted(() => ({
  upload: vi.fn(),
  state: { isUploading: false, progress: 0 },
}));

vi.mock("@hooks/api", () => ({
  useDropImportUpload: () => ({
    upload: spies.upload,
    isUploading: spies.state.isUploading,
    progress: spies.state.progress,
  }),
}));

import { UploadPanel } from "../components/UploadPanel";

function okResult(): DropImportUploadResult {
  return { ok: true, batchId: "batch-1", totalFiles: 1, rejected: [] };
}

describe("UploadPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    spies.state.isUploading = false;
    spies.state.progress = 0;
  });

  it("renders the dropzone with the accepted extensions on the file input", () => {
    const { container } = render(<UploadPanel onResult={vi.fn()} />);

    expect(screen.getByRole("button", { name: "Upload audio files" })).toBeInTheDocument();
    const input = container.querySelector("input[type=file]");
    expect(input).toHaveAttribute("accept", ".mp3,.flac,.m4a,.ogg,.wav,.opus,.aac,.wma,.zip");
    expect(input).toHaveAttribute("multiple");
  });

  it("uploads the selected files and reports the result to the caller", async () => {
    const user = userEvent.setup();
    const onResult = vi.fn();
    spies.upload.mockResolvedValue(okResult());
    const { container } = render(<UploadPanel onResult={onResult} />);

    const input = container.querySelector("input[type=file]");
    if (!(input instanceof HTMLInputElement)) throw new Error("file input not found");
    const file = new File(["audio"], "song.mp3", { type: "audio/mpeg" });
    await user.upload(input, file);

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(okResult()));
    expect(spies.upload).toHaveBeenCalledTimes(1);
    expect(spies.upload.mock.calls[0][0].map((f: File) => f.name)).toEqual(["song.mp3"]);
  });

  it("shows the progress bar while an upload is in flight", () => {
    spies.state.isUploading = true;
    spies.state.progress = 0.4;
    render(<UploadPanel onResult={vi.fn()} />);

    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "40");
    expect(screen.getByRole("status")).toHaveTextContent("Uploading... 40%");
  });
});
