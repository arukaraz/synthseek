import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enHealth from "@modules/i18n/messages/en/health.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { SlskdStatusBadge } from "../SlskdStatusBadge";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "health", enHealth, true, true);
});

describe("SlskdStatusBadge", () => {
  it("announces the healthy status via a polite status region", () => {
    render(<SlskdStatusBadge status="healthy" />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(enSettings.slskd.status.healthy);
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("renders the unhealthy label", () => {
    render(<SlskdStatusBadge status="unhealthy" />);

    expect(screen.getByText(enSettings.slskd.status.unhealthy)).toBeInTheDocument();
  });

  it("renders the not configured label", () => {
    render(<SlskdStatusBadge status="not_configured" />);

    expect(screen.getByText(enSettings.slskd.status.notConfigured)).toBeInTheDocument();
  });

  it("renders the supporting message when provided", () => {
    render(<SlskdStatusBadge status="unhealthy" message="Connection refused" />);

    expect(screen.getByText("Connection refused")).toBeInTheDocument();
  });

  it("prefers the localized message code over the raw message", () => {
    render(<SlskdStatusBadge status="not_configured" message="raw fallback" messageCode="SLSKD_NOT_CONFIGURED" />);

    expect(screen.getByText(enHealth.SLSKD_NOT_CONFIGURED)).toBeInTheDocument();
    expect(screen.queryByText("raw fallback")).not.toBeInTheDocument();
  });

  it("interpolates message params into the localized code", () => {
    render(<SlskdStatusBadge status="unhealthy" messageCode="SLSKD_API_ERROR" messageParams={{ status: "503" }} />);

    expect(screen.getByText("API returned status 503")).toBeInTheDocument();
  });

  it("falls back to the raw message when no code is present", () => {
    render(<SlskdStatusBadge status="unhealthy" message="Network unreachable" />);

    expect(screen.getByText("Network unreachable")).toBeInTheDocument();
  });

  it("omits the supporting message when absent", () => {
    const { container } = render(<SlskdStatusBadge status="healthy" />);

    expect(container.querySelector("p")).toBeNull();
  });
});
