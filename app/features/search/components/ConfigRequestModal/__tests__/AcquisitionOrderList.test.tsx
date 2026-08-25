import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSearch from "@modules/i18n/messages/en/search.json";

import { AcquisitionOrderList } from "../AcquisitionOrderList";
import type { AcquisitionSelection } from "../types";

const acq = enSearch.config.options.acquisition;

beforeAll(() => {
  i18n.addResourceBundle("en", "search", enSearch, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const manual: AcquisitionSelection = {
  mode: "manual",
  order: ["slskd", "usenet", "ytdlp"],
  active: ["slskd", "usenet"],
};

function renderList(selection: AcquisitionSelection, lidarrAvailable = false) {
  const onChange = vi.fn();
  render(
    <AcquisitionOrderList
      label="Acquisition"
      selection={selection}
      lidarrAvailable={lidarrAvailable}
      onChange={onChange}
    />
  );
  return onChange;
}

describe("AcquisitionOrderList", () => {
  it("hides the ordered list while automatic is on", () => {
    renderList({ mode: "auto", order: ["slskd", "ytdlp"], active: ["slskd", "ytdlp"] });

    expect(screen.queryByText(acq.slskd.label)).not.toBeInTheDocument();
  });

  it("switches to manual when automatic is turned off", async () => {
    const onChange = renderList({ mode: "auto", order: ["slskd"], active: ["slskd"] });

    await userEvent.click(screen.getByRole("switch", { name: acq.auto.ariaLabel }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mode: "manual" }));
  });

  it("lists every source in its arranged order, including deselected ones", () => {
    renderList(manual);

    const rows = screen.getAllByRole("listitem");
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent(acq.slskd.label);
    expect(rows[2]).toHaveTextContent(acq.ytdlp.label);
  });

  it("numbers the rows by position", () => {
    renderList(manual);

    const rows = screen.getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("1");
    expect(rows[1]).toHaveTextContent("2");
  });

  it("checks only the active sources", () => {
    renderList(manual);

    expect(screen.getByRole("checkbox", { name: `Use ${acq.slskd.label}` })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: `Use ${acq.ytdlp.label}` })).not.toBeChecked();
  });

  it("moves a source up", async () => {
    const onChange = renderList(manual);

    await userEvent.click(screen.getByRole("button", { name: `Move ${acq.usenet.label} up` }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ order: ["usenet", "slskd", "ytdlp"] }));
  });

  it("cannot move the first source up", () => {
    renderList(manual);

    expect(screen.getByRole("button", { name: `Move ${acq.slskd.label} up` })).toBeDisabled();
  });

  it("cannot move the last source down", () => {
    renderList(manual);

    expect(screen.getByRole("button", { name: `Move ${acq.ytdlp.label} down` })).toBeDisabled();
  });

  it("toggles a source without disturbing the order", async () => {
    const onChange = renderList(manual);

    await userEvent.click(screen.getByRole("checkbox", { name: `Use ${acq.ytdlp.label}` }));

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ order: ["slskd", "usenet", "ytdlp"], active: ["slskd", "usenet", "ytdlp"] })
    );
  });

  it("offers the lidarr hand-off only when lidarr is available", () => {
    renderList(manual);
    expect(screen.queryByRole("button", { name: acq.lidarr.switch })).not.toBeInTheDocument();

    cleanup();
    renderList(manual, true);
    expect(screen.getByRole("button", { name: acq.lidarr.switch })).toBeInTheDocument();
  });

  it("switches to the lidarr hand-off and back", async () => {
    const onChange = renderList(manual, true);

    await userEvent.click(screen.getByRole("button", { name: acq.lidarr.switch }));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ mode: "lidarr" }));
  });

  it("keeps the arranged order visible while the lidarr hand-off is active", () => {
    renderList({ ...manual, mode: "lidarr" }, true);

    expect(screen.getByRole("button", { name: acq.lidarr.active })).toBeInTheDocument();
    expect(screen.queryByText(acq.slskd.label)).not.toBeInTheDocument();
  });
});
