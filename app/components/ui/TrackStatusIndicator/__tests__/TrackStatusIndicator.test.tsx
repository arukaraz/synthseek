import { describe, it, expect, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { FailureReason, RequestStatus } from "@api/__generated__/types";
import i18n from "@modules/i18n";

import enComponents from "@modules/i18n/messages/en/components.json";
import enStatus from "@modules/i18n/messages/en/status.json";

import { TrackStatusIndicator } from "../TrackStatusIndicator";

beforeAll(() => {
  i18n.addResourceBundle("en", "status", enStatus, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

afterEach(() => {
  cleanup();
});

describe("TrackStatusIndicator", () => {
  it.each(FailureReason.options)("renders a translated label for the %s failure reason", (reason) => {
    render(<TrackStatusIndicator status={RequestStatus.enum.failed} failureReason={reason} />);

    expect(screen.getByText(enStatus.failureReason[reason].label)).toBeInTheDocument();
    expect(screen.queryByText(`failureReason.${reason}.label`)).not.toBeInTheDocument();
  });

  it("falls back to the status label when there is no failure reason", () => {
    render(<TrackStatusIndicator status={RequestStatus.enum.failed} />);

    expect(screen.getByText(enStatus.request.failed.label)).toBeInTheDocument();
  });
});
