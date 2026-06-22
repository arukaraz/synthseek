import { describe, expect, it } from "vitest";

import enDiscover from "@modules/i18n/messages/en/discover.json";
import { render, screen } from "@test/test-utils";

import { SETTINGS_HREF } from "../constants";
import { RecentScrobblesEmpty } from "../RecentScrobblesEmpty";

describe("RecentScrobblesEmpty", () => {
  it("renders the error reason without a call to action", () => {
    render(<RecentScrobblesEmpty reason="error" />);

    expect(screen.getByText(enDiscover.recentScrobbles.empty.error)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the disabled reason with an open-settings link", () => {
    render(<RecentScrobblesEmpty reason="disabled" />);

    expect(screen.getByText(enDiscover.recentScrobbles.empty.disabled)).toBeInTheDocument();
    const link = screen.getByRole("link", { name: enDiscover.recentScrobbles.empty.ctaOpenSettings });
    expect(link).toHaveAttribute("href", SETTINGS_HREF);
  });

  it("renders the no-username reason with a configure link", () => {
    render(<RecentScrobblesEmpty reason="no-username" />);

    expect(screen.getByText(enDiscover.recentScrobbles.empty.noUsername)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: enDiscover.recentScrobbles.empty.ctaConfigure })).toHaveAttribute(
      "href",
      SETTINGS_HREF
    );
  });

  it("renders the no-data reason without a call to action", () => {
    render(<RecentScrobblesEmpty reason="no-data" />);

    expect(screen.getByText(enDiscover.recentScrobbles.empty.noData)).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
