import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { LOG_LEVEL_DEFAULT_CLASS, LOG_LEVEL_STYLES, logRequestId } from "../styles";
import type { LogEntry } from "../types";
import { LogLineRow } from "../LogLineRow";

function entry(overrides: Partial<LogEntry> = {}): LogEntry {
  return { raw: "[INFO] application started", level: "INFO", requestId: null, ...overrides };
}

afterEach(() => {
  cleanup();
});

describe("LogLineRow", () => {
  it("renders the raw line as a single node when there is no request id", () => {
    const { container } = render(<LogLineRow entry={entry()} />);
    const line = container.firstElementChild;
    expect(line).toHaveTextContent("[INFO] application started");
    expect(line?.querySelector(`.${CSS.escape("text-secondary-400")}`)).toBeNull();
  });

  it("applies the level color class for a known level", () => {
    const { container } = render(<LogLineRow entry={entry({ level: "ERROR", raw: "[ERROR] boom" })} />);
    expect(container.firstElementChild).toHaveClass(LOG_LEVEL_STYLES.ERROR);
  });

  it("applies the default color class when the level is null", () => {
    const { container } = render(<LogLineRow entry={entry({ level: null, raw: "raw text" })} />);
    expect(container.firstElementChild).toHaveClass(LOG_LEVEL_DEFAULT_CLASS);
  });

  it("highlights the request id marker as a separate span", () => {
    render(<LogLineRow entry={entry({ raw: "before [req-7] after", requestId: "req-7" })} />);
    const marker = screen.getByText("[req-7]");
    expect(marker.tagName).toBe("SPAN");
    expect(marker).toHaveClass(logRequestId());
  });

  it("renders the text around the request id marker", () => {
    const { container } = render(<LogLineRow entry={entry({ raw: "before [req-7] after", requestId: "req-7" })} />);
    expect(container.firstElementChild).toHaveTextContent("before [req-7] after");
  });

  it("falls back to a plain line when the request id is not present in the raw text", () => {
    render(<LogLineRow entry={entry({ raw: "no marker here", requestId: "req-9" })} />);
    expect(screen.queryByText("[req-9]")).not.toBeInTheDocument();
    expect(screen.getByText("no marker here")).toBeInTheDocument();
  });
});
