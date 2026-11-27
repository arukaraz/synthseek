import { render, screen } from "@testing-library/react";
import { ListMusic } from "lucide-react";
import { describe, expect, it } from "vitest";

import { createSetList, createSetResult } from "@test/factories";

import { widgetItemsOf } from "../helpers";
import { PostersBlock } from "../PostersBlock";
import { SET_POSTER_COLUMNS } from "../constants";

const NAMES = ["On repeat", "Rewind", "Deep cuts", "Road trip"];

function renderPosters(size: "S" | "M" | "L") {
  const lists = NAMES.map((name, index) => createSetList({ slotId: `s${index + 1}`, name }));
  const items = widgetItemsOf(createSetResult({ lists }), undefined);
  render(
    <PostersBlock
      shape={null}
      items={items}
      stats={[]}
      points={[]}
      cells={[]}
      pages={[]}
      covers={[]}
      size={size}
      accent="daily"
      controls={() => ({})}
      heading={{ name: "Mixes", description: "", icon: ListMusic }}
    />
  );
}

describe("posters of a playlist widget", () => {
  it.each(["S", "M", "L"] as const)("keeps the lists at %s to one row, so each card has room for its name", (size) => {
    renderPosters(size);

    expect(screen.getAllByRole("heading")).toHaveLength(Math.min(SET_POSTER_COLUMNS[size], NAMES.length));
  });
});
