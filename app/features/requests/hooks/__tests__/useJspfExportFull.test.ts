import { ContentType } from "@api/__generated__/types";
import { act, renderHook } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { makeRequestWithTracks } from "../../__tests__/factories";
import { useJspfExportFull } from "../useJspfExportFull";

interface MutateOptions {
  onSuccess?: (doc: unknown) => void;
  onError?: (error: unknown) => void;
}

const { mutate, downloadText, toastError, mutateState } = vi.hoisted(() => ({
  mutate: vi.fn(),
  downloadText: vi.fn(),
  toastError: vi.fn(),
  mutateState: { isPending: false },
}));

vi.mock("@hooks/api/mutations/portability/useExportFullPortability", () => ({
  useExportFullPortability: () => ({ mutate, isPending: mutateState.isPending }),
}));

vi.mock("@utils/download", () => ({
  downloadText: (filename: string, text: string) => downloadText(filename, text),
}));

vi.mock("@utils/uuid", () => ({
  generateUuid: () => "fixed-job-id",
}));

vi.mock("sonner", () => ({
  toast: { error: (message: string) => toastError(message) },
}));

describe("useJspfExportFull", () => {
  beforeEach(() => {
    mutateState.isPending = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("exposes the generated job id and pending flag after start", () => {
    mutateState.isPending = true;
    const { result } = renderHook(() => useJspfExportFull(makeRequestWithTracks(), vi.fn()));

    expect(result.current.jobId).toBe("");
    expect(result.current.isExporting).toBe(true);

    act(() => result.current.start());

    expect(result.current.jobId).toBe("fixed-job-id");
  });

  it("requests a playlist export with the generated job id", () => {
    const request = makeRequestWithTracks({ id: "req-9", contentType: ContentType.enum.playlist });
    const { result } = renderHook(() => useJspfExportFull(request, vi.fn()));

    act(() => result.current.start());

    expect(mutate).toHaveBeenCalledWith(
      { id: "req-9", type: "playlist", jobId: "fixed-job-id" },
      expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) })
    );
  });

  it("requests an album export when the content type is not a playlist", () => {
    const request = makeRequestWithTracks({ id: "req-10", contentType: ContentType.enum.album });
    const { result } = renderHook(() => useJspfExportFull(request, vi.fn()));

    act(() => result.current.start());

    expect(mutate).toHaveBeenCalledWith(expect.objectContaining({ id: "req-10", type: "album" }), expect.anything());
  });

  it("downloads the resolved document and closes the dialog on success", () => {
    const onOpenChange = vi.fn();
    const request = makeRequestWithTracks({ name: "My Mix" });
    const { result } = renderHook(() => useJspfExportFull(request, onOpenChange));

    act(() => result.current.start());
    const options: MutateOptions = mutate.mock.calls[0][1];
    act(() => options.onSuccess?.({ title: "playlist" }));

    expect(downloadText).toHaveBeenCalledWith("my-mix.jspf", JSON.stringify({ title: "playlist" }, null, 2));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows an error toast and keeps the dialog open on failure", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useJspfExportFull(makeRequestWithTracks(), onOpenChange));

    act(() => result.current.start());
    const options: MutateOptions = mutate.mock.calls[0][1];
    act(() => options.onError?.(new Error("boom")));

    expect(toastError).toHaveBeenCalledWith("Export failed");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
