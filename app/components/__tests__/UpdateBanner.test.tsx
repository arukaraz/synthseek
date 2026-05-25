import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UpdateBanner } from "../UpdateBanner/UpdateBanner";

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
      span: ({ children, className, ...props }: React.ComponentProps<"span">) => (
        <span className={className} {...props}>
          {children}
        </span>
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

  describe("breaking-update variant", () => {
    it("does not render the MAJOR UPDATE label for a minor bump", () => {
      render(<UpdateBanner latestVersion="1.5.0" currentVersion="1.4.2" />);
      expect(screen.queryByText(/major update/i)).not.toBeInTheDocument();
    });

    it("renders the MAJOR UPDATE label when major version bumps", () => {
      render(<UpdateBanner latestVersion="2.0.0" currentVersion="1.4.2" />);
      expect(screen.getByText(/major update/i)).toBeInTheDocument();
      expect(screen.getByText(/review patch notes before upgrading/i)).toBeInTheDocument();
    });

    it("renders MAJOR UPDATE for 2.x → 3.0", () => {
      render(<UpdateBanner latestVersion="3.0.0" currentVersion="2.4.1" />);
      expect(screen.getByText(/major update/i)).toBeInTheDocument();
    });

    it("falls back to normal variant on unparseable versions", () => {
      render(<UpdateBanner latestVersion="dev" currentVersion="1.0.0" />);
      expect(screen.queryByText(/major update/i)).not.toBeInTheDocument();
    });
  });
});
