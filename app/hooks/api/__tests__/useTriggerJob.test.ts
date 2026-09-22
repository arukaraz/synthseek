import { describe, expect, it, vi, beforeEach } from "vitest";

const toasts = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const errors = vi.hoisted(() => ({ errorToast: vi.fn(), extractAppCode: vi.fn() }));
const cache = vi.hoisted(() => ({ invalidate: vi.fn() }));
const captured = vi.hoisted(() => ({ options: null as Record<string, unknown> | null }));

vi.mock("sonner", () => ({ toast: toasts }));
vi.mock("@modules/errors", () => errors);
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ jobs: { list: { invalidate: cache.invalidate } } }),
    jobs: {
      trigger: {
        useMutation: (options: Record<string, unknown>) => {
          captured.options = options;
          return { mutate: vi.fn() };
        },
      },
    },
  },
}));

import { useTriggerJob } from "../mutations/jobs/useTriggerJob";

function useCapturedHandlers(): { onSuccess: (result: unknown) => void; onError: (error: unknown) => void } {
  useTriggerJob();
  const options = captured.options as {
    onSuccess: (result: unknown) => void;
    onError: (error: unknown) => void;
  };
  return options;
}

beforeEach(() => {
  vi.clearAllMocks();
  errors.extractAppCode.mockReturnValue(undefined);
});

describe("asking a job to run now", () => {
  it("refreshes the list and says so when the job starts", () => {
    useCapturedHandlers().onSuccess({ message: "Loudness Measurement started" });

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(toasts.success).toHaveBeenCalledWith("Loudness Measurement started");
  });

  it("treats an already-running job as stale state to refresh, not as a failure to shout about", () => {
    errors.extractAppCode.mockReturnValue("JOB_ALREADY_RUNNING");

    useCapturedHandlers().onError(new Error("whatever the transport wrapped"));

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(errors.errorToast).not.toHaveBeenCalled();
  });

  it("still reports a real failure", () => {
    errors.extractAppCode.mockReturnValue("SOMETHING_ELSE");

    useCapturedHandlers().onError(new Error("boom"));

    expect(cache.invalidate).not.toHaveBeenCalled();
    expect(errors.errorToast).toHaveBeenCalledTimes(1);
  });
});
