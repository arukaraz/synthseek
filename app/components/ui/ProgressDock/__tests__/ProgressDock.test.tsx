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
});
