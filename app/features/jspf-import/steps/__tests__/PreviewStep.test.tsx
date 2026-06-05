import { render, screen } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enLibrary from "@modules/i18n/messages/en/library.json";

import { createMockImportPreview } from "@test/mocks/feature-hooks.mock";

vi.mock("@hooks/api/subscriptions/usePortabilityProgress", () => ({
  usePortabilityProgress: () => null,
}));

import { PreviewStep } from "../PreviewStep";

beforeAll(() => {
  i18n.addResourceBundle("en", "library", enLibrary, true, true);
});

function renderPreview(overrides: Partial<React.ComponentProps<typeof PreviewStep>> = {}) {
  return render(
    <PreviewStep
      jobId="job-001"
      preview={createMockImportPreview()}
      isPreviewing={false}
      isCommitting={false}
      errorMessage={null}
      selected={new Set(["0:0"])}
      onToggleTrack={vi.fn()}
      onConfirm={vi.fn()}
      onBack={vi.fn()}
      {...overrides}
    />
  );
}

describe("PreviewStep", () => {
  it("renders the matched header derived from the mocked preview", () => {
    renderPreview();

    expect(
      screen.getByText(enLibrary.jspfImport.preview.matchedHeader.replace("{{matched}}", "1").replace("{{total}}", "2"))
    ).toBeInTheDocument();
  });

  it("renders the busy progress state while committing", () => {
    renderPreview({ isCommitting: true });

    expect(screen.getByText(enLibrary.jspfImport.preview.creatingRequests, { exact: false })).toBeInTheDocument();
  });

  it("renders the error fallback when preview is absent", () => {
    renderPreview({ preview: undefined, errorMessage: "boom" });

    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});
