import { render, screen } from "@test/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { DataTable } from "../Table";
import type { ColumnDef } from "../types";

interface Row {
  id: string;
}

const columns: ColumnDef<Row>[] = [{ key: "id", header: "Id", cell: (row) => row.id }];
const data: Row[] = [{ id: "1" }];

let scrollWidth = 0;
let clientWidth = 0;

class ImmediateResizeObserver {
  constructor(private readonly callback: () => void) {}
  observe(): void {
    this.callback();
  }
  unobserve(): void {}
  disconnect(): void {}
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", ImmediateResizeObserver);
  Object.defineProperty(HTMLElement.prototype, "scrollWidth", { configurable: true, get: () => scrollWidth });
  Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => clientWidth });
});

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(HTMLElement.prototype, "scrollWidth");
  Reflect.deleteProperty(HTMLElement.prototype, "clientWidth");
});

describe("DataTable that scrolls sideways", () => {
  it("is a named region the keyboard can reach once it is wider than its box", () => {
    scrollWidth = 900;
    clientWidth = 400;

    render(<DataTable data={data} columns={columns} getRowId={(row) => row.id} />);

    const region = screen.getByRole("region", { name: "Table, scrolls sideways" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toContainElement(screen.getByRole("table"));
  });

  it("adds no region and no tab stop while everything fits", () => {
    scrollWidth = 300;
    clientWidth = 400;

    render(<DataTable data={data} columns={columns} getRowId={(row) => row.id} />);

    expect(screen.queryByRole("region")).not.toBeInTheDocument();
  });
});
