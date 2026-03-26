import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UpdateBanner } from "../UpdateBanner";

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      div: ({ children, className, ...props }: React.ComponentProps<"div">) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
      button: ({ children, className, ...props }: React.ComponentProps<"button">) => (
        <button className={className} {...props}>
          {children}
        </button>
      ),
    },
  };
});

describe("UpdateBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders version information", () => {
    render(<UpdateBanner latestVersion="1.1.0" currentVersion="1.0.2" />);

    expect(screen.getByText("Version 1.1.0")).toBeInTheDocument();
    expect(screen.getByText("(current: 1.0.2)")).toBeInTheDocument();
  });

  it("renders patch notes link", () => {
    render(<UpdateBanner latestVersion="1.1.0" currentVersion="1.0.2" />);

    const link = screen.getByText("Patch Notes");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://github.com/arukaraz/synthseek/blob/main/PATCH-NOTES.md");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders dismiss button with aria-label", () => {
    render(<UpdateBanner latestVersion="1.1.0" currentVersion="1.0.2" />);

    expect(screen.getByLabelText("Dismiss update notification")).toBeInTheDocument();
  });

  it("hides banner when dismiss button is clicked", () => {
    render(<UpdateBanner latestVersion="1.1.0" currentVersion="1.0.2" />);

    expect(screen.getByText("Version 1.1.0")).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText("Dismiss update notification"));

    expect(screen.queryByText("Version 1.1.0")).not.toBeInTheDocument();
  });

  it("renders available text", () => {
    render(<UpdateBanner latestVersion="2.0.0" currentVersion="1.0.0" />);

    expect(screen.getByText(/is available/)).toBeInTheDocument();
  });

  it("displays different version numbers correctly", () => {
    render(<UpdateBanner latestVersion="3.2.1" currentVersion="1.5.0" />);

    expect(screen.getByText("Version 3.2.1")).toBeInTheDocument();
    expect(screen.getByText("(current: 1.5.0)")).toBeInTheDocument();
  });
});
