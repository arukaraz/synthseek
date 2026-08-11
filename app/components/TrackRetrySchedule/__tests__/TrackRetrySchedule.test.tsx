import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TrackRetrySchedule } from "../TrackRetrySchedule";

const inHours = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000 + 5 * 60 * 1000);

describe("TrackRetrySchedule", () => {
  it("renders nothing when there is neither a schedule nor an attempt", () => {
    const { container } = render(<TrackRetrySchedule nextRetryAt={null} retryCount={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("shows the scheduled attempt", () => {
    render(<TrackRetrySchedule nextRetryAt={inHours(2)} retryCount={0} />);

    expect(screen.getByText("Next attempt in 2h")).toBeInTheDocument();
  });

  it("shows the attempt count even without a schedule", () => {
    render(<TrackRetrySchedule nextRetryAt={null} retryCount={3} />);

    expect(screen.getByText("3 attempts so far")).toBeInTheDocument();
  });

  it("shows both facts together, matching the review queue wording", () => {
    render(<TrackRetrySchedule nextRetryAt={inHours(26)} retryCount={1} />);

    expect(screen.getByText("Next attempt in 1d")).toBeInTheDocument();
    expect(screen.getByText("1 attempt so far")).toBeInTheDocument();
  });

  it("omits the retry affordance when no handler is supplied", () => {
    render(<TrackRetrySchedule nextRetryAt={inHours(2)} retryCount={2} />);

    expect(screen.queryByRole("button", { name: "Retry now" })).not.toBeInTheDocument();
  });

  it("calls the supplied handler from the retry affordance", async () => {
    const user = userEvent.setup();
    const onRetryNow = vi.fn();
    render(<TrackRetrySchedule nextRetryAt={inHours(2)} retryCount={2} onRetryNow={onRetryNow} />);

    await user.click(screen.getByRole("button", { name: "Retry now" }));

    expect(onRetryNow).toHaveBeenCalledOnce();
  });
});
