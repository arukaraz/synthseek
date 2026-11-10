import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@test/test-utils";

import { NEW_WIDGET_DRAFT } from "../../../constants";
import { WorkshopPreview } from "../WorkshopPreview";

vi.mock("../../CustomWidget/CustomWidgetContent", () => ({
  CustomWidgetContent: () => <div data-testid="preview-widget" />,
}));

function renderPreview(isRefreshing: boolean) {
  const { container } = render(
    <WorkshopPreview
      draft={NEW_WIDGET_DRAFT}
      result={undefined}
      isLoading={false}
      isRefreshing={isRefreshing}
      isError={false}
      onSizeChange={vi.fn()}
    />
  );
  return container.querySelector("[aria-busy]");
}

describe("WorkshopPreview", () => {
  it("dims the old preview under a spinner while the new one is on its way", () => {
    const box = renderPreview(true);

    expect(box).toHaveAttribute("aria-busy", "true");
    expect(screen.getByRole("status")).toHaveTextContent("Updating the preview");
    expect(screen.getByTestId("preview-widget").closest(".opacity-40")).not.toBeNull();
  });

  it("shows the preview plainly once it is current", () => {
    const box = renderPreview(false);

    expect(box).toHaveAttribute("aria-busy", "false");
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByTestId("preview-widget").closest(".opacity-40")).toBeNull();
  });
});
