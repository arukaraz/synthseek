import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen } from "@test/test-utils";

import { OrganiseProgress } from "../OrganiseProgress";
import { makeOrganiseStatus } from "./fixtures";

vi.mock("@hooks/api/mutations/library/useLibraryOrganiseControls", () => ({
  useCancelLibraryOrganise: () => ({ mutate: vi.fn() }),
}));

const FINISHED = {
  startedAt: "2026-10-14T10:00:00.000Z",
  finishedAt: "2026-10-14T10:00:03.000Z",
};

describe("OrganiseProgress once a run has finished", () => {
  it("speaks of one file in the singular and says nothing about companions when none moved", () => {
    renderWithProviders(
      <OrganiseProgress status={makeOrganiseStatus({ ...FINISHED, total: 1, processed: 1, moved: 1 })} />
    );

    expect(screen.getByText(/^Moved 1 file in /)).toBeInTheDocument();
    expect(screen.queryByText(/lyrics or artwork/)).not.toBeInTheDocument();
  });

  it("counts several files and the lyrics or artwork that went with them", () => {
    renderWithProviders(
      <OrganiseProgress
        status={makeOrganiseStatus({ ...FINISHED, total: 1200, processed: 1200, moved: 1200, companionsMoved: 1 })}
      />
    );

    expect(screen.getByText(/^Moved 1,200 files in /)).toBeInTheDocument();
    expect(screen.getByText("1 lyrics or artwork file went with them.")).toBeInTheDocument();
  });
});
