import { render, screen } from "@test/test-utils";
import { afterEach, describe, expect, it, vi } from "vitest";

import { RequestsActivityDivider } from "../RequestsActivityDivider";

const { activityState } = vi.hoisted(() => ({
  activityState: { state: "idle", synced: 0, total: 0 },
}));

vi.mock("../../../hooks/useActivityState", () => ({
  useActivityState: () => activityState,
}));

describe("RequestsActivityDivider", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders its children", () => {
    render(
      <RequestsActivityDivider>
        <span>toolbar slot</span>
      </RequestsActivityDivider>
    );

    expect(screen.getByText("toolbar slot")).toBeInTheDocument();
  });

  it("renders without children", () => {
    const { container } = render(<RequestsActivityDivider />);

    expect(container.firstChild).not.toBeNull();
  });
});
