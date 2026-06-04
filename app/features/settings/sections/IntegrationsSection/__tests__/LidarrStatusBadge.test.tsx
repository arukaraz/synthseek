import { describe, it, expect, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";

import i18n from "@modules/i18n";

import enHealth from "@modules/i18n/messages/en/health.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { LidarrStatusBadge } from "../LidarrStatusBadge";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "health", enHealth, true, true);
});

describe("LidarrStatusBadge", () => {
  it("announces the healthy status via a polite status region", () => {
    render(<LidarrStatusBadge status="healthy" />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(enSettings.lidarr.status.healthy);
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("renders the unhealthy label", () => {
    render(<LidarrStatusBadge status="unhealthy" />);

    expect(screen.getByText(enSettings.lidarr.status.unhealthy)).toBeInTheDocument();
  });

  it("renders the not configured label", () => {
    render(<LidarrStatusBadge status="not_configured" />);

    expect(screen.getByText(enSettings.lidarr.status.notConfigured)).toBeInTheDocument();
  });

  it("renders the supporting message when provided", () => {
    render(<LidarrStatusBadge status="unhealthy" message="Connection refused" />);

    expect(screen.getByText("Connection refused")).toBeInTheDocument();
  });

  it("prefers the localized message code over the raw message", () => {
    render(<LidarrStatusBadge status="not_configured" message="raw fallback" messageCode="LIDARR_NOT_CONFIGURED" />);

    expect(screen.getByText(enHealth.LIDARR_NOT_CONFIGURED)).toBeInTheDocument();
    expect(screen.queryByText("raw fallback")).not.toBeInTheDocument();
  });

  it("interpolates message params into the localized code", () => {
    render(<LidarrStatusBadge status="healthy" messageCode="LIDARR_CONNECTED" messageParams={{ version: "2.0.0" }} />);

    expect(screen.getByText("Connected (v2.0.0)")).toBeInTheDocument();
  });

  it("falls back to the raw message when no code is present", () => {
    render(<LidarrStatusBadge status="unhealthy" message="Network unreachable" />);

    expect(screen.getByText("Network unreachable")).toBeInTheDocument();
  });

  it("omits the supporting message when absent", () => {
    const { container } = render(<LidarrStatusBadge status="healthy" />);

    expect(container.querySelector("p")).toBeNull();
  });
});
