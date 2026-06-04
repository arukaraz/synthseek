import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { EnrichmentStep } from "../EnrichmentStep";

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const renderStep = () =>
  render(<EnrichmentStep stepIndex={3} totalSteps={5} onComplete={vi.fn()} onBack={vi.fn()} onSkip={vi.fn()} />);

describe("EnrichmentStep", () => {
  it("renders each enrichment field description matching the Settings copy", () => {
    renderStep();

    expect(screen.getByText("System-wide Last.fm API key. Shared across all users.")).toBeInTheDocument();
    expect(screen.getByText("Artwork sourcing.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Resolves track URLs across platforms for cross-platform playlist imports. Synthseek uses the public endpoint by default. Leave blank unless you have a key."
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText("Audio fingerprinting fallback for tracks without reliable tag metadata.")
    ).toBeInTheDocument();
    expect(screen.getByText("Required. Without it, Synthseek shares rate-limited email.")).toBeInTheDocument();
  });
});
