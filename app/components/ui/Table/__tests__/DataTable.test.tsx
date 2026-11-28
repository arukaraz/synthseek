import { render, screen, userEvent, within } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { DataTable } from "../Table";
import type { ColumnDef } from "../types";

interface Row {
  id: string;
  name: string;
  group: string;
}

const rows: Row[] = [
  { id: "1", name: "One", group: "A" },
  { id: "2", name: "Two", group: "A" },
  { id: "3", name: "Three", group: "B" },
];

const columns: ColumnDef<Row>[] = [
  {
    key: "name",
    header: "Name",
    sortable: true,
    cell: (row) => (
      <span>
        {row.name} <a href={`#${row.id}`}>link {row.id}</a>
      </span>
    ),
  },
  { key: "group", header: "Group", cell: (row) => row.group },
];

const bodyRows = () => within(screen.getAllByRole("rowgroup")[1]).getAllByRole("row");

describe("DataTable", () => {
  it("heads a row only where the group header callback returns one", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderGroupHeader={(row, index) =>
          index === 0 || rows[index - 1].group !== row.group ? `Group ${row.group}` : null
        }
      />
    );

    expect(bodyRows().map((row) => row.textContent)).toEqual([
      "Group A",
      "One link 1A",
      "Two link 2A",
      "Group B",
      "Three link 3B",
    ]);
    expect(screen.getByText("Group A")).toHaveAttribute("colspan", "2");
  });

  it("puts an expansion right under its own row, spanning every column", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        renderExpansion={(row) => (row.id === "2" ? <p>details of two</p> : null)}
      />
    );

    const texts = bodyRows().map((row) => row.textContent);
    expect(texts).toEqual(["One link 1A", "Two link 2A", "details of two", "Three link 3B"]);
    expect(screen.getByText("details of two").closest("td")).toHaveAttribute("colspan", "2");
  });

  it("spans an expansion only over the columns on screen, so a hidden column adds no empty slot", () => {
    const style = document.createElement("style");
    style.textContent = ".off-screen { display: none; }";
    document.head.appendChild(style);
    const withHidden: ColumnDef<Row>[] = [
      ...columns,
      { key: "extra", header: "Extra", cell: () => "x", className: "off-screen" },
    ];

    render(
      <DataTable
        data={rows}
        columns={withHidden}
        getRowId={(row) => row.id}
        renderExpansion={(row) => (row.id === "1" ? <p>details of one</p> : null)}
        emptyMessage="none"
      />
    );

    expect(screen.getByText("details of one").closest("td")).toHaveAttribute("colspan", "2");
    style.remove();
  });

  it("tells assistive technology which way the active column is sorted", () => {
    render(
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortState={{ field: "name", direction: "desc" }}
        onSort={vi.fn()}
      />
    );

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "descending");
  });

  it("says a sortable column that is not active is unsorted", () => {
    render(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} onSort={vi.fn()} />);

    expect(screen.getByRole("columnheader", { name: /Name/ })).toHaveAttribute("aria-sort", "none");
  });

  it("says how long the whole table is and where each row sits when only part of it is drawn", () => {
    render(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} totalRows={250} />);

    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "251");
    expect(screen.getAllByRole("row").map((row) => row.getAttribute("aria-rowindex"))).toEqual(["1", "2", "3", "4"]);
  });

  it("never reports fewer rows than it draws", () => {
    render(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} totalRows={1} />);

    expect(screen.getByRole("table")).toHaveAttribute("aria-rowcount", "4");
  });

  it("leaves a table without a known total exactly as it was", () => {
    render(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} />);

    expect(screen.getByRole("table")).not.toHaveAttribute("aria-rowcount");
    for (const row of screen.getAllByRole("row")) expect(row).not.toHaveAttribute("aria-rowindex");
  });

  it("leaves a link inside a clickable row to the link, without clicking the row", async () => {
    const onRowClick = vi.fn();
    render(<DataTable data={rows} columns={columns} getRowId={(row) => row.id} onRowClick={onRowClick} />);

    await userEvent.click(screen.getByRole("link", { name: "link 1" }));
    expect(onRowClick).not.toHaveBeenCalled();

    await userEvent.click(screen.getByText("Three", { exact: false }));
    expect(onRowClick).toHaveBeenCalledWith(rows[2]);
  });
});
