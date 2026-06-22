import { describe, it, expect, vi } from "vitest";

import { render, renderWithProviders, screen } from "@test/test-utils";
import type { LibraryFacetValue } from "@hooks/api/queries/library/types";
import type { FacetDef } from "../../../types";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string, opts?: { count?: number }) => (opts ? `${key}:${opts.count}` : key) }),
}));

import { FacetGroup } from "../FacetGroup";

function makeValues(count: number): LibraryFacetValue[] {
  return Array.from({ length: count }, (_, index) => ({
    value: `v${index}`,
    label: `Value ${index}`,
    count: index + 1,
  }));
}

const searchableDef: FacetDef = {
  key: "artist",
  labelKey: "page.facets.artist",
  searchable: true,
  facetSearchKey: "artist",
};

const plainDef: FacetDef = {
  key: "source",
  labelKey: "page.facets.source",
  searchable: false,
};

const staticDef: FacetDef = {
  key: "status",
  labelKey: "page.facets.status",
  searchable: false,
  staticValues: ["complete", "failed"],
  labelNs: "status",
};

function baseProps() {
  return {
    selected: [],
    searchTerm: "",
    onToggle: vi.fn(),
    onSearch: vi.fn(),
  };
}

describe("FacetGroup", () => {
  it("renders an empty hint when there are no values", () => {
    render(<FacetGroup def={plainDef} values={[]} {...baseProps()} />);

    expect(screen.getByText("page.facets.noValues")).toBeInTheDocument();
  });

  it("renders a row per value with its formatted count", () => {
    render(<FacetGroup def={plainDef} values={makeValues(3)} {...baseProps()} />);

    expect(screen.getByText("Value 0")).toBeInTheDocument();
    expect(screen.getByText("Value 2")).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
  });

  it("toggles a value when its checkbox is clicked", async () => {
    const onToggle = vi.fn();
    const { user } = renderWithProviders(
      <FacetGroup def={plainDef} values={makeValues(2)} {...baseProps()} onToggle={onToggle} />
    );

    await user.click(screen.getAllByRole("checkbox")[0]);

    expect(onToggle).toHaveBeenCalledWith("v0");
  });

  it("truncates a searchable facet to the top N and shows a more hint for the remainder", () => {
    render(<FacetGroup def={searchableDef} values={makeValues(12)} {...baseProps()} />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(8);
    expect(screen.getByText("page.facets.moreHint:4")).toBeInTheDocument();
  });

  it("shows all matches and hides the more hint while a search term is active", () => {
    render(<FacetGroup def={searchableDef} values={makeValues(12)} {...baseProps()} searchTerm="Value" />);

    expect(screen.getAllByRole("checkbox")).toHaveLength(12);
    expect(screen.queryByText(/page.facets.moreHint/)).not.toBeInTheDocument();
  });

  it("renders one row per static value regardless of the returned facet values", () => {
    render(
      <FacetGroup def={staticDef} values={[{ value: "complete", label: "Complete", count: 5 }]} {...baseProps()} />
    );

    expect(screen.getAllByRole("checkbox")).toHaveLength(2);
    expect(screen.queryByText(/page.facets.moreHint/)).not.toBeInTheDocument();
  });

  it("renders the facet search input only for a searchable facet", () => {
    const { rerender } = render(<FacetGroup def={searchableDef} values={makeValues(2)} {...baseProps()} />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();

    rerender(<FacetGroup def={plainDef} values={makeValues(2)} {...baseProps()} />);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
