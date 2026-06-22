import { RequestStatus } from "@api/__generated__/types";
import { render } from "@test/test-utils";
import { describe, expect, it } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { TrackStatusCell } from "../TrackStatusCell";

describe("TrackStatusCell", () => {
  it("renders a status indicator for the track status", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.downloading })} />
    );

    expect(container.firstChild).not.toBeNull();
  });

  it("renders for a failed track carrying a failure reason", () => {
    const { container } = render(
      <TrackStatusCell track={makeRequestsTrack({ status: RequestStatus.enum.failed, failure_reason: "not_found" })} />
    );

    expect(container.firstChild).not.toBeNull();
  });
});
