import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RejectedFilesList } from "../components/RejectedFilesList";

describe("RejectedFilesList", () => {
  it("renders nothing for an empty list", () => {
    const { container } = render(<RejectedFilesList entries={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders each rejected file with its translated reason", () => {
    render(
      <RejectedFilesList
        entries={[
          { name: "notes.txt", reason: "unsupportedType" },
          { name: "evil.zip", reason: "zipSlip" },
          { name: "inner.zip", reason: "nestedArchive" },
          { name: "overflow.mp3", reason: "batchCap" },
          { name: "broken.zip", reason: "extractionError" },
        ]}
      />
    );

    expect(screen.getByText("notes.txt")).toBeInTheDocument();
    expect(screen.getByText("Unsupported file type")).toBeInTheDocument();
    expect(screen.getByText("Archive rejected for unsafe paths")).toBeInTheDocument();
    expect(screen.getByText("Nested archives are not supported")).toBeInTheDocument();
    expect(screen.getByText("Batch file limit reached")).toBeInTheDocument();
    expect(screen.getByText("Could not extract the archive")).toBeInTheDocument();
    expect(screen.getByText("5 files were not accepted")).toBeInTheDocument();
  });
});
