import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import enLibrary from "@modules/i18n/messages/en/library.json";

import { MasterTableHeader } from "../components/MasterTableHeader";

describe("MasterTableHeader", () => {
  it("names the column of selection boxes", () => {
    render(
      <table>
        <MasterTableHeader />
      </table>
    );

    expect(screen.getByRole("columnheader", { name: enLibrary.librarySource.table.columnSelect })).toBeInTheDocument();
  });
});
