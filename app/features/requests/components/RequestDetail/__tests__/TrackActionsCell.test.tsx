import { render, screen, userEvent } from "@test/test-utils";
import { describe, expect, it, vi } from "vitest";

import { makeRequestsTrack } from "../../../__tests__/factories";
import { PriorityCell } from "../PriorityCell";
import { TrackActionsCell } from "../TrackActionsCell";

describe("RequestDetail PriorityCell", () => {
  it("renders the prioritized chip when priority is positive", () => {
    render(<PriorityCell track={makeRequestsTrack({ priority: 1 })} />);

    expect(screen.getByText("Prioritized")).toBeInTheDocument();
  });

  it("renders nothing when priority is zero", () => {
    const { container } = render(<PriorityCell track={makeRequestsTrack({ priority: 0 })} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe("RequestDetail TrackActionsCell", () => {
  it("renders a placeholder dash when no action applies", () => {
    render(<TrackActionsCell track={makeRequestsTrack()} actions={[]} onAction={vi.fn()} />);

    expect(screen.getByText("-")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("lists the actions it is given, in order, under a menu named after the track", async () => {
    render(
      <TrackActionsCell
        track={makeRequestsTrack({ title: "Midnight City" })}
        actions={[
          { id: "prioritize", lock: null },
          { id: "cancel", lock: null },
        ]}
        onAction={vi.fn()}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Actions for Midnight City" }));

    const items = screen.getAllByRole("menuitem");
    expect(items.map((item) => item.textContent)).toEqual(["Jump the queue", "Cancel track"]);
  });

  it("runs the action that was picked", async () => {
    const onAction = vi.fn();
    render(
      <TrackActionsCell track={makeRequestsTrack()} actions={[{ id: "upgrade", lock: null }]} onAction={onAction} />
    );

    await userEvent.click(screen.getByRole("button", { name: "Actions for A Song" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Search better quality" }));

    expect(onAction).toHaveBeenCalledWith("upgrade");
  });

  it("keeps a locked action visible but disabled, with the reason beside it", async () => {
    const onAction = vi.fn();
    render(
      <TrackActionsCell
        track={makeRequestsTrack()}
        actions={[{ id: "approve", lock: "adminOnly" }]}
        onAction={onAction}
      />
    );

    await userEvent.click(screen.getByRole("button", { name: "Actions for A Song" }));
    const item = screen.getByRole("menuitem", { name: /Approve/ });

    expect(item).toHaveAttribute("aria-disabled", "true");
    expect(item).toHaveTextContent("Only an admin can approve or reject");
  });
});
