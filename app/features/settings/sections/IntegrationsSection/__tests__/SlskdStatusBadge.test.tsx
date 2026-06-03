import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { SlskdStatusBadge } from "../SlskdStatusBadge";
import { SLSKD_STATUS_LABEL } from "../constants";

describe("SlskdStatusBadge", () => {
  it("announces the healthy status via a polite status region", () => {
    render(<SlskdStatusBadge status="healthy" />);

    const region = screen.getByRole("status");
    expect(region).toHaveTextContent(SLSKD_STATUS_LABEL.healthy);
    expect(region).toHaveAttribute("aria-live", "polite");
  });

  it("renders the unhealthy label", () => {
    render(<SlskdStatusBadge status="unhealthy" />);

    expect(screen.getByText(SLSKD_STATUS_LABEL.unhealthy)).toBeInTheDocument();
  });

  it("renders the not configured label", () => {
    render(<SlskdStatusBadge status="not_configured" />);

    expect(screen.getByText(SLSKD_STATUS_LABEL.not_configured)).toBeInTheDocument();
  });

  it("renders the supporting message when provided", () => {
    render(<SlskdStatusBadge status="unhealthy" message="Connection refused" />);

    expect(screen.getByText("Connection refused")).toBeInTheDocument();
  });

  it("omits the supporting message when absent", () => {
    const { container } = render(<SlskdStatusBadge status="healthy" />);

    expect(container.querySelector("p")).toBeNull();
  });
});
