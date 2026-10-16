import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { SEARCH_RESULT_LIMIT } from "../constants";
import { SettingsSearchResults } from "../SettingsSearchResults";
import type { SettingsSearchResult } from "../../../types";

function result(anchor: string, label: string, place: string): SettingsSearchResult {
  return {
    entry: { labelKey: "mcp.title", page: "apps", href: "/settings/apps", anchor },
    label,
    place,
  };
}

describe("SettingsSearchResults", () => {
  it("summarises a single result in a single place", () => {
    render(<SettingsSearchResults query="key" results={[result("a", "API key", "Apps")]} onPick={vi.fn()} />);
    expect(screen.getByText(i18n.t("settings:shell.search.summary", { count: 1, places: 1 }))).toBeInTheDocument();
  });

  it("pluralises the summary and counts distinct places", () => {
    const results = [
      result("a", "API key", "Apps"),
      result("b", "Last.fm key", "Listening"),
      result("c", "Token", "Apps"),
    ];
    render(<SettingsSearchResults query="key" results={results} onPick={vi.fn()} />);
    const summary = i18n.t("settings:shell.search.summary", { count: 3, places: 2 });
    expect(summary).not.toBe(i18n.t("settings:shell.search.summary", { count: 1, places: 1 }));
    expect(screen.getByText(summary)).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("says nothing matched when there are no results", () => {
    render(<SettingsSearchResults query="zzz" results={[]} onPick={vi.fn()} />);
    expect(screen.getByText(enSettings.shell.search.empty)).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("hands the picked result back", async () => {
    const onPick = vi.fn();
    const picked = result("b", "Last.fm key", "Listening");
    render(<SettingsSearchResults query="key" results={[result("a", "API key", "Apps"), picked]} onPick={onPick} />);
    await userEvent.click(screen.getByText("Listening"));
    expect(onPick).toHaveBeenCalledWith(picked);
  });

  it("marks the matched part of each label", () => {
    render(<SettingsSearchResults query="key" results={[result("a", "API key", "Apps")]} onPick={vi.fn()} />);
    const mark = screen.getByText("key");
    expect(mark.tagName).toBe("MARK");
    expect(screen.getByText("API").tagName).toBe("SPAN");
  });

  it("renders at most the result limit while counting every result", () => {
    const results = Array.from({ length: SEARCH_RESULT_LIMIT + 1 }, (_, index) =>
      result(`anchor-${index}`, `Entry ${index}`, "Apps")
    );
    render(<SettingsSearchResults query="entry" results={results} onPick={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(SEARCH_RESULT_LIMIT);
    expect(
      screen.getByText(i18n.t("settings:shell.search.summary", { count: SEARCH_RESULT_LIMIT + 1, places: 1 }))
    ).toBeInTheDocument();
  });
});
