import { describe, expect, it, vi, beforeEach } from "vitest";

const toasts = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
const errors = vi.hoisted(() => ({ errorToast: vi.fn(), extractAppCode: vi.fn() }));
const cache = vi.hoisted(() => ({ invalidate: vi.fn() }));
interface CapturedHandlers {
  onSuccess: (result: unknown) => void;
  onError: (error: unknown) => void;
}

const captured = vi.hoisted((): { options: CapturedHandlers | null } => ({ options: null }));

vi.mock("sonner", () => ({ toast: toasts }));
vi.mock("@modules/errors", () => errors);
vi.mock("@utils/trpc", () => ({
  trpc: {
    useUtils: () => ({ jobs: { list: { invalidate: cache.invalidate } } }),
    jobs: {
      stop: {
        useMutation: (options: CapturedHandlers) => {
          captured.options = options;
          return { mutate: vi.fn() };
        },
      },
    },
  },
}));

import { useStopJob } from "../mutations/jobs/useStopJob";

function useCapturedHandlers(): CapturedHandlers {
  useStopJob();
  const { options } = captured;
  if (options === null) throw new Error("the mutation registered no handlers");
  return options;
}

beforeEach(() => {
  vi.clearAllMocks();
  errors.extractAppCode.mockReturnValue(undefined);
});

describe("asking a running job to stop", () => {
  it("refreshes the list and says so when the job accepts the request", () => {
    useCapturedHandlers().onSuccess({ message: "Loudness Measurement will stop shortly" });

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(toasts.success).toHaveBeenCalledWith("Loudness Measurement will stop shortly");
  });

  it("treats a job that already finished as stale state to refresh, not as a failure to shout about", () => {
    errors.extractAppCode.mockReturnValue("JOB_NOT_RUNNING");

    useCapturedHandlers().onError(new Error("whatever the transport wrapped"));

    expect(cache.invalidate).toHaveBeenCalledTimes(1);
    expect(errors.errorToast).not.toHaveBeenCalled();
  });

  it("still reports a real failure", () => {
    errors.extractAppCode.mockReturnValue("JOB_NOT_STOPPABLE");

    useCapturedHandlers().onError(new Error("boom"));

    expect(cache.invalidate).not.toHaveBeenCalled();
    expect(errors.errorToast).toHaveBeenCalledTimes(1);
  });
});
