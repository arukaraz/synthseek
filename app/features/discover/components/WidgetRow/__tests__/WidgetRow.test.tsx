import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@test/test-utils";

import { WidgetRow } from "../WidgetRow";

vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src }: { src: string }) => <img src={src} alt="" />,
}));

describe("WidgetRow", () => {
  it("shows the title, subtitle, lead and trailing parts", () => {
    render(
      <ul>
        <WidgetRow cover="a.jpg" seed="t1" title="Joga" subtitle="Bjork" lead={3} trailing="12 plays" />
      </ul>
    );

    expect(screen.getByRole("listitem")).toHaveTextContent("3JogaBjork12 plays");
    expect(document.querySelector("img")).toHaveAttribute("src", expect.stringContaining("a.jpg"));
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("turns the cover and text into a button when it can be selected", () => {
    const onSelect = vi.fn();
    render(
      <ul>
        <WidgetRow cover={null} seed="t1" title="Joga" subtitle="Bjork" onSelect={onSelect} />
      </ul>
    );

    fireEvent.click(screen.getByRole("button", { name: /Joga/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(document.querySelector("img")).toBeNull();
  });
});
