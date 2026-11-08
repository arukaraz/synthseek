import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, within } from "@test/test-utils";
import enComponents from "@modules/i18n/messages/en/components.json";

import { SHEET_DRAG } from "@hooks/ui/constants";

import { BottomSheet } from "../BottomSheet";
import { BottomSheetHeader } from "../BottomSheetHeader";

const phoneWidth = vi.hoisted(() => vi.fn(() => true));

vi.mock("@hooks/ui/useMediaQuery", () => ({
  useMediaQuery: () => phoneWidth(),
}));

function touch(target: Element, type: string, y: number | null, time: number) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.defineProperty(event, "touches", { value: y === null ? [] : [{ clientX: 0, clientY: y }] });
  Object.defineProperty(event, "timeStamp", { value: time });
  target.dispatchEvent(event);
}

function renderSheet(open: boolean, onOpenChange = vi.fn(), subtitle?: string) {
  const view = renderWithProviders(
    <BottomSheet open={open} onOpenChange={onOpenChange} showClose={false}>
      <BottomSheetHeader title="Queue" subtitle={subtitle} />
      <p>Up next</p>
    </BottomSheet>
  );
  return { ...view, onOpenChange };
}

describe("BottomSheet", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing while closed", () => {
    renderSheet(false);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens as a dialog named by its header, with its content", async () => {
    renderSheet(true, vi.fn(), "3 tracks");

    const sheet = await screen.findByRole("dialog", { name: "Queue" });
    expect(sheet).toHaveAccessibleDescription("3 tracks");
    expect(within(sheet).getByText("Up next")).toBeInTheDocument();
  });

  it("falls back to the title as the description when there is no subtitle", async () => {
    renderSheet(true);

    expect(await screen.findByRole("dialog", { name: "Queue" })).toHaveAccessibleDescription("Queue");
  });

  it("closes from the header close button", async () => {
    const { user, onOpenChange } = renderSheet(true);

    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("button", { name: enComponents.dialog.close }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  async function dragDown(phone: boolean) {
    phoneWidth.mockReturnValue(phone);
    const { onOpenChange } = renderSheet(true);
    const sheet = await screen.findByRole("dialog");
    vi.useFakeTimers();

    touch(sheet, "touchstart", 100, 0);
    touch(sheet, "touchmove", 110, 100);
    touch(sheet, "touchmove", 100 + SHEET_DRAG.DISMISS_DISTANCE_PX + 1, 5000);
    touch(sheet, "touchend", null, 5010);
    vi.advanceTimersByTime(SHEET_DRAG.SETTLE_MS);
    return onOpenChange;
  }

  it("closes when dragged down past the threshold on a phone", async () => {
    const onOpenChange = await dragDown(true);

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores the drag from tablet width up, where it shows as a dialog", async () => {
    const onOpenChange = await dragDown(false);

    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
