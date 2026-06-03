import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { DoneStep } from "../DoneStep";
import { DONE_COPY } from "../../constants";

const finishMutateAsync = vi.fn<() => Promise<unknown>>();

vi.mock("@hooks/api/mutations/settings/useFinishWizard", () => ({
  useFinishWizard: () => ({ mutateAsync: finishMutateAsync }),
}));

const onFinish = vi.fn();

const renderStep = () => render(<DoneStep stepIndex={4} totalSteps={5} onFinish={onFinish} />);

const dashboardButton = () => screen.getByRole("button", { name: DONE_COPY.primaryRest });

describe("DoneStep", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    finishMutateAsync.mockResolvedValue(undefined);
  });

  it("does not fire finishWizard on mount", () => {
    renderStep();

    expect(finishMutateAsync).not.toHaveBeenCalled();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("fires finishWizard and navigates on success when the dashboard button is pressed", async () => {
    renderStep();

    fireEvent.click(dashboardButton());

    await waitFor(() => expect(finishMutateAsync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
  });

  it("shows the failure strip with a retry and does not navigate when finishWizard rejects", async () => {
    finishMutateAsync.mockRejectedValueOnce(new Error("boom"));
    renderStep();

    fireEvent.click(dashboardButton());

    await waitFor(() => expect(screen.getByText(DONE_COPY.failed)).toBeInTheDocument());
    expect(screen.getByRole("button", { name: DONE_COPY.primaryRetry })).toBeInTheDocument();
    expect(onFinish).not.toHaveBeenCalled();
  });

  it("disables the button while completing so completion cannot double-fire", async () => {
    let resolveFinish: (() => void) | undefined;
    finishMutateAsync.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveFinish = resolve;
        })
    );
    renderStep();

    fireEvent.click(dashboardButton());

    await waitFor(() => expect(screen.getByRole("button", { name: DONE_COPY.primaryBusy })).toBeDisabled());

    resolveFinish?.();
    await waitFor(() => expect(onFinish).toHaveBeenCalledTimes(1));
    expect(finishMutateAsync).toHaveBeenCalledTimes(1);
  });
});
