import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { DestinationStatus } from "../components/DestinationStatus";
import { makeDestination } from "./fixtures";

const status = enSettings.notifications.status;
const failures = enSettings.notifications.failures;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(cleanup);

describe("DestinationStatus", () => {
  it("says a destination that was never saved is not set up", () => {
    render(<DestinationStatus destination={undefined} />);

    expect(screen.getByText(status.notConfigured)).toBeInTheDocument();
  });

  it("says a saved destination has not been sent anything yet", () => {
    render(<DestinationStatus destination={makeDestination()} />);

    expect(screen.getByText(status.neverDelivered)).toBeInTheDocument();
  });

  it("names when the last notification went out", () => {
    render(<DestinationStatus destination={makeDestination({ lastDeliveredAt: new Date() })} />);

    expect(screen.getByText(/^Last sent /)).toBeInTheDocument();
  });

  it("puts the last failure ahead of an older delivery", () => {
    render(
      <DestinationStatus
        destination={makeDestination({
          lastFailure: "timeout",
          lastFailureAt: new Date(),
          lastDeliveredAt: new Date(),
        })}
      />
    );

    expect(screen.getByRole("status")).toHaveTextContent(`The last one did not arrive: ${failures.timeout}`);
  });

  it("adds the HTTP status when the service answered with one", () => {
    render(<DestinationStatus destination={makeDestination({ lastFailure: "rejected", lastFailureCode: 404 })} />);

    expect(screen.getByRole("status")).toHaveTextContent(
      `The last one did not arrive: ${failures.rejected} (HTTP 404)`
    );
  });
});
