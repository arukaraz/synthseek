import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { EnrichmentStep } from "../EnrichmentStep";
import { ENRICHMENT_FIELD_DESCRIPTIONS } from "../../constants";

vi.mock("@hooks/api/mutations/settings/useUpdateConnections", () => ({
  useUpdateConnectionsEnrichment: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

const renderStep = () =>
  render(<EnrichmentStep stepIndex={3} totalSteps={5} onComplete={vi.fn()} onBack={vi.fn()} onSkip={vi.fn()} />);

describe("EnrichmentStep", () => {
  it("renders each enrichment field description matching the Settings copy", () => {
    renderStep();

    expect(screen.getByText(ENRICHMENT_FIELD_DESCRIPTIONS.lastfm)).toBeInTheDocument();
    expect(screen.getByText(ENRICHMENT_FIELD_DESCRIPTIONS.fanart)).toBeInTheDocument();
    expect(screen.getByText(ENRICHMENT_FIELD_DESCRIPTIONS.songlink)).toBeInTheDocument();
    expect(screen.getByText(ENRICHMENT_FIELD_DESCRIPTIONS.acoustid)).toBeInTheDocument();
    expect(screen.getByText(ENRICHMENT_FIELD_DESCRIPTIONS.musicbrainzEmail)).toBeInTheDocument();
  });
});
