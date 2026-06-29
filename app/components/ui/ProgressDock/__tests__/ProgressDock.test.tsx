import { render, screen, within, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { buildDockItems, finalizeDockJob, markDockItem, seedDockJob, setDockJobStatus } from "@hooks/api/subscriptions";
import { resetDockStore } from "@hooks/api/subscriptions/shared/progressDock";

import { ProgressDock } from "../ProgressDock";

const reducedMotion = vi.hoisted(() => ({ value: false }));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();
  return {
    ...actual,
    useReducedMotion: () => reducedMotion.value,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    motion: new Proxy(
      {},
      {
        get: () => (props: Record<string, unknown>) => {
          const { children, ...rest } = props;
          const safe = Object.fromEntries(
            Object.entries(rest).filter(([key]) => !["initial", "animate", "exit", "transition"].includes(key))
          );
          return <div {...safe}>{children as React.ReactNode}</div>;
        },
      }
    ),
  };
});

function seedLibrary(): void {
  seedDockJob({
    id: "dock-test",
    kind: "library-import",
    provider: "spotify",
    items: buildDockItems([
      { key: "a", name: "Alpha" },
      { key: "b", name: "Beta" },
      { key: "c", name: "Gamma" },
    ]),
    status: "running",
  });
}

function seedRequest(trackCount: number, name: string): void {
  seedDockJob({
    id: "req-test",
    kind: "request",
    items: buildDockItems(
      Array.from({ length: Math.max(trackCount, 1) }, (_, index) => ({
        key: `track-${index}`,
        name: index === 0 ? name : "",
      }))
    ),
    status: "running",
  });
}

beforeEach(() => {
  reducedMotion.value = false;
  act(() => {
    resetDockStore();
  });
});

describe("ProgressDock", () => {
  it("renders nothing visible when there is no active job", () => {
    render(<ProgressDock />);
    expect(screen.queryByText("Importing from Spotify")).not.toBeInTheDocument();
  });

  it("renders a running library import with the provider title and the done count", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "done");
    });
    expect(screen.getByText("Importing from Spotify")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the complete title when the job completes", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "done");
      markDockItem("dock-test", "b", "done");
      markDockItem("dock-test", "c", "done");
      setDockJobStatus("dock-test", "complete");
    });
    expect(screen.getAllByText("Import complete").length).toBeGreaterThan(0);
  });

  it("shows the failed count when the job is partial", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "done");
      markDockItem("dock-test", "b", "failed");
      setDockJobStatus("dock-test", "partial");
    });
    expect(screen.getByText("failed")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the localized failure reason on a failed row", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "failed", "notInLibrary");
      setDockJobStatus("dock-test", "partial");
    });
    expect(screen.getByText("Not in your library")).toBeInTheDocument();
  });

  it("falls back to a generic failed label when a failed item has no reason", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "failed");
      setDockJobStatus("dock-test", "partial");
    });
    expect(screen.getAllByText("Failed").length).toBeGreaterThan(0);
  });

  it("shows complete for an all-skipped job once finalized", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "skipped");
      markDockItem("dock-test", "b", "skipped");
      markDockItem("dock-test", "c", "skipped");
      finalizeDockJob("dock-test");
    });
    expect(screen.getAllByText("Import complete").length).toBeGreaterThan(0);
  });

  it("labels every skipped row as already in library", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "skipped");
      markDockItem("dock-test", "b", "skipped");
      markDockItem("dock-test", "c", "skipped");
      finalizeDockJob("dock-test");
    });
    expect(screen.getAllByText("Already in library")).toHaveLength(3);
  });

  it("breaks the subtitle into imported vs already in library on a partial-skip job", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "done");
      markDockItem("dock-test", "b", "done");
      markDockItem("dock-test", "c", "skipped");
      finalizeDockJob("dock-test");
    });
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/imported, 1 already in library/)).toBeInTheDocument();
    expect(screen.getByText("Already in library")).toBeInTheDocument();
  });

  it("hides the body list when minimized", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
    });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    act(() => {
      screen.getByRole("button", { name: "Minimize" }).click();
    });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("dismisses the job when the dismiss button is pressed", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
    });
    expect(screen.getAllByText("Importing from Spotify").length).toBeGreaterThan(0);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    act(() => {
      screen.getByRole("button", { name: "Dismiss" }).click();
    });
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("announces progress in the live region", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "done");
    });
    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("1 of 3 done");
  });

  it("renders the mobile compact meta with the current item name", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      markDockItem("dock-test", "a", "importing");
    });
    expect(screen.getByText("0 of 3 · Alpha")).toBeInTheDocument();
  });

  it("does not crash under reduced motion", () => {
    reducedMotion.value = true;
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
    });
    expect(screen.getAllByText("Importing from Spotify").length).toBeGreaterThan(0);
    void within;
  });

  it("renders a running request with the interpolated title and no controls", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(3, "Album One");
    });
    expect(screen.getAllByText("Queueing Album One").length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Processing 3 tracks/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: "Minimize" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Dismiss" })).not.toBeInTheDocument();
  });

  it("uses the long-run copy for a request over the track threshold, with the while-clause before please-wait", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(60, "Big Playlist");
    });
    expect(screen.getAllByText("Processing 60 tracks, this might take a while, please wait…").length).toBeGreaterThan(
      0
    );
  });

  it("lets the running request subtitle wrap to multiple lines instead of truncating", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(60, "Big Playlist");
    });
    const subtitle = screen.getAllByText("Processing 60 tracks, this might take a while, please wait…")[0];
    const paragraph = subtitle.closest("p");
    expect(paragraph).toHaveClass("whitespace-normal");
    expect(paragraph).not.toHaveClass("truncate");
  });

  it("swaps to a close-only control set once the request job is terminal", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(2, "Album One");
      setDockJobStatus("req-test", "complete");
    });
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Minimize" })).not.toBeInTheDocument();
    expect(screen.getAllByText("Queued Album One").length).toBeGreaterThan(0);
  });

  it("shows the queued-tracks subtitle and queued title on a complete request, never done-of-total", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(71, "Long Playlist");
      setDockJobStatus("req-test", "complete");
    });
    expect(screen.getAllByText("Queued Long Playlist").length).toBeGreaterThan(0);
    expect(screen.getAllByText("71 tracks queued").length).toBeGreaterThan(0);
    expect(screen.queryByText("0 of 71")).not.toBeInTheDocument();
    expect(screen.queryByText(/of 71/)).not.toBeInTheDocument();
  });

  it("shows the unavailable subtitle on a partial request", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(5, "Mixed Album");
      setDockJobStatus("req-test", "partial");
    });
    expect(screen.getAllByText("Queued Mixed Album").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Some tracks were unavailable").length).toBeGreaterThan(0);
  });

  it("shows the failed subtitle on a failed request", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(5, "Broken Album");
      setDockJobStatus("req-test", "failed");
    });
    expect(screen.getAllByText("Couldn't queue Broken Album").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Request failed").length).toBeGreaterThan(0);
  });

  it("pluralizes the complete subtitle for a single-track request", () => {
    render(<ProgressDock />);
    act(() => {
      seedRequest(1, "Single Track");
      setDockJobStatus("req-test", "complete");
    });
    expect(screen.getAllByText("1 track queued").length).toBeGreaterThan(0);
  });

  it("renders every active job as its own card, not just the latest", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      seedRequest(3, "Album One");
    });
    expect(screen.getAllByText("Importing from Spotify").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Queueing Album One").length).toBeGreaterThan(0);
  });

  it("orders cards newest first by updatedAt", () => {
    vi.useFakeTimers();
    const { container } = render(<ProgressDock />);
    act(() => {
      seedRequest(3, "Album One");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
      seedLibrary();
    });
    const titles = Array.from(container.querySelectorAll("p.text-fg")).map((node) => node.textContent);
    const requestIndex = titles.findIndex((text) => text === "Queueing Album One");
    const libraryIndex = titles.findIndex((text) => text === "Importing from Spotify");
    expect(requestIndex).toBeGreaterThanOrEqual(0);
    expect(libraryIndex).toBeGreaterThanOrEqual(0);
    expect(libraryIndex).toBeLessThan(requestIndex);
    vi.useRealTimers();
  });

  it("dismisses only the targeted card and leaves the others mounted", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      seedRequest(2, "Album One");
      setDockJobStatus("req-test", "complete");
    });
    expect(screen.getAllByText("Importing from Spotify").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Queued Album One").length).toBeGreaterThan(0);

    const requestCard = screen.getAllByText("Queued Album One")[0].closest("div[class*='rounded-2xl']");
    expect(requestCard).not.toBeNull();
    const dismissInRequest = within(requestCard as HTMLElement).getByRole("button", { name: "Dismiss" });
    act(() => {
      dismissInRequest.click();
    });

    expect(screen.queryByText("Queued Album One")).not.toBeInTheDocument();
    expect(screen.getAllByText("Importing from Spotify").length).toBeGreaterThan(0);
    expect(screen.getByText("Alpha")).toBeInTheDocument();
  });

  it("minimizes one card without collapsing the body of another", () => {
    render(<ProgressDock />);
    act(() => {
      seedLibrary();
      seedDockJob({
        id: "dock-test-2",
        kind: "library-import",
        provider: "spotify",
        items: buildDockItems([
          { key: "x", name: "Delta" },
          { key: "y", name: "Epsilon" },
        ]),
        status: "running",
      });
    });
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();

    const alphaCard = screen.getByText("Alpha").closest("div[class*='rounded-2xl']");
    expect(alphaCard).not.toBeNull();
    const minimizeInAlpha = within(alphaCard as HTMLElement).getByRole("button", { name: "Minimize" });
    act(() => {
      minimizeInAlpha.click();
    });

    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
    expect(screen.getByText("Delta")).toBeInTheDocument();
  });

  it("floats above the bottom nav on mobile and sits at the corner on desktop", () => {
    const { container } = render(<ProgressDock />);
    const viewport = container.firstElementChild;
    expect(viewport).toHaveClass("bottom-[var(--height-bottom-nav)]");
    expect(viewport).toHaveClass("sm:bottom-5");
    expect(viewport).toHaveClass("inset-x-0");
    expect(viewport).toHaveClass("z-50");
  });
});
