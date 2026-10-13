import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { TrackRetrySchedule } from "../TrackRetrySchedule";

const inHours = (hours: number) => new Date(Date.now() + hours * 60 * 60 * 1000 + 5 * 60 * 1000);

describe("TrackRetrySchedule", () => {
  it("renders nothing when there is neither a schedule nor an attempt", () => {
    const { container } = render(<TrackRetrySchedule nextRetryAt={null} retryCount={0} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("carries the schedule in the popover behind the clock", async () => {
    const user = userEvent.setup();
    render(<TrackRetrySchedule nextRetryAt={inHours(2)} retryCount={0} />);

    const trigger = screen.getByRole("button", { name: /watching this track/i });
    expect(screen.queryByText(/Next attempt in 2h/)).not.toBeInTheDocument();

    await user.click(trigger);

    expect(await screen.findByText(/Next attempt in 2h/)).toBeInTheDocument();
    expect(screen.getByText(/watching this track/i)).toBeInTheDocument();
  });

  it("shows the attempt count even without a schedule", () => {
    render(<TrackRetrySchedule nextRetryAt={null} retryCount={3} />);

    expect(screen.getByText(/3 attempts/)).toBeInTheDocument();
  });

  it("shows the attempt count inline beside the clock", () => {
    render(<TrackRetrySchedule nextRetryAt={inHours(26)} retryCount={1} />);

    expect(screen.getByText("1 attempt")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /watching this track/i })).toBeInTheDocument();
  });

  it("keeps the attempt count out of the line when compact, and puts it in the popover behind the clock", async () => {
    const user = userEvent.setup();
    render(<TrackRetrySchedule nextRetryAt={inHours(2)} retryCount={3} compact />);

    expect(screen.queryByText("3 attempts")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /watching this track/i }));

    expect(await screen.findByText("3 attempts")).toBeInTheDocument();
  });

  it("names the attempt count on the history icon when compact and not watched", () => {
    render(<TrackRetrySchedule nextRetryAt={null} retryCount={2} compact />);

    expect(screen.queryByText("2 attempts")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 attempts" })).toHaveAttribute("title", "2 attempts");
  });
});
