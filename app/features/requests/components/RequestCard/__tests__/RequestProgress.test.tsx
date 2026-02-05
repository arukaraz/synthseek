import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@test/test-utils";
import { RequestProgress } from "../RequestProgress";
import { RequestStatus } from "@api/__generated__/types";

vi.mock("@utils/formatters", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@utils/formatters")>();
  return {
    ...actual,
    formatTimestamp: () => "10:30 AM",
    formatDuration: () => "2m 30s",
  };
});

describe("RequestProgress", () => {
  const baseProps = {
    status: RequestStatus.enum.queued,
    createdAt: new Date().toISOString(),
  };

  describe("track variant", () => {
    it("renders status description", () => {
      render(<RequestProgress {...baseProps} variant="track" />);

      expect(screen.getByText("Waiting in queue")).toBeInTheDocument();
    });

    it("renders progress percentage when greater than 0", () => {
      render(<RequestProgress {...baseProps} variant="track" progress={50} status={RequestStatus.enum.downloading} />);

      expect(screen.getByText("50%")).toBeInTheDocument();
    });

    it("does not render progress percentage when 0", () => {
      render(<RequestProgress {...baseProps} variant="track" progress={0} />);

      expect(screen.queryByText("0%")).not.toBeInTheDocument();
    });

    it("renders duration when available", () => {
      render(<RequestProgress {...baseProps} variant="track" completedAt={new Date().toISOString()} />);

      expect(screen.getByText("2m 30s")).toBeInTheDocument();
    });

    it("renders timestamp", () => {
      render(<RequestProgress {...baseProps} variant="track" />);

      expect(screen.getByText("10:30 AM")).toBeInTheDocument();
    });

    it("renders progress bar", () => {
      render(<RequestProgress {...baseProps} variant="track" />);

      expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    });
  });

  describe("album variant", () => {
    const albumProps = {
      ...baseProps,
      variant: "album" as const,
      completedTracks: 5,
      totalTracks: 10,
    };

    it("renders track count", () => {
      render(<RequestProgress {...albumProps} />);

      expect(screen.getByText("5/10 tracks")).toBeInTheDocument();
    });

    it("calculates progress percentage from tracks", () => {
      render(<RequestProgress {...albumProps} />);

      expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    });

    it("hides track count for single track albums", () => {
      render(<RequestProgress {...albumProps} isSingleTrack totalTracks={1} completedTracks={0} />);

      expect(screen.queryByText(/tracks/)).not.toBeInTheDocument();
    });

    it("hides progress bar for single track albums", () => {
      render(<RequestProgress {...albumProps} isSingleTrack totalTracks={1} completedTracks={0} />);

      expect(screen.queryByTestId("progress-bar")).not.toBeInTheDocument();
    });

    it("handles totalTracks of 0 without division error", () => {
      render(<RequestProgress {...albumProps} totalTracks={0} completedTracks={0} />);

      expect(screen.getByText("0/0 tracks")).toBeInTheDocument();
      expect(screen.getByTestId("progress-bar")).toBeInTheDocument();
    });
  });

  describe("different statuses", () => {
    it("shows correct description for downloading", () => {
      render(<RequestProgress {...baseProps} variant="track" status={RequestStatus.enum.downloading} />);

      expect(screen.getByText("In progress")).toBeInTheDocument();
    });

    it("shows correct description for complete", () => {
      render(<RequestProgress {...baseProps} variant="track" status={RequestStatus.enum.complete} />);

      expect(screen.getByText("Download complete")).toBeInTheDocument();
    });

    it("shows correct description for failed", () => {
      render(<RequestProgress {...baseProps} variant="track" status={RequestStatus.enum.failed} />);

      expect(screen.getByText("Download failed")).toBeInTheDocument();
    });
  });

  it("applies data-status attribute", () => {
    const { container } = render(<RequestProgress {...baseProps} variant="track" />);

    expect(container.firstChild).toHaveAttribute("data-status", RequestStatus.enum.queued);
  });
});
