import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import type { NotificationDestination, NotificationTestOutcome } from "../types";
import { makeCatalog, makeDestination, makeMemberCatalog } from "./fixtures";

const save = createMockMutation();
const remove = createMockMutation();
const test = createMockMutation();

vi.mock("@hooks/api", () => ({
  useSaveNotificationDestination: () => save,
  useRemoveNotificationDestination: () => remove,
  useTestNotificationDestination: () => test,
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { ChannelPanel } from "../components/ChannelPanel";

const copy = enSettings.notifications;
const saveBar = enSettings.shell.saveBar;

interface Callbacks<T> {
  onSuccess: (value: T) => void;
}

function settle<T>(mutate: ReturnType<typeof vi.fn>, value: T) {
  const callbacks: Callbacks<T> = mutate.mock.calls[0][1];
  act(() => callbacks.onSuccess(value));
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  save.isPending = false;
});

describe("ChannelPanel", () => {
  it("saves a new destination once its required fields are filled, then confirms it", async () => {
    const { rerender } = render(<ChannelPanel channel="ntfy" destination={undefined} catalog={makeCatalog()} />);

    expect(screen.queryByRole("button", { name: copy.actions.test })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: copy.kinds.review_new }));
    expect(screen.getByRole("button", { name: saveBar.save })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(copy.fields.topic.label), { target: { value: " mine " } });
    await userEvent.click(screen.getByRole("button", { name: saveBar.save }));

    expect(save.mutate).toHaveBeenCalledWith(
      {
        channel: "ntfy",
        enabled: true,
        config: { serverUrl: "https://ntfy.sh", topic: "mine", accessToken: "" },
        kinds: ["review_new"],
        allRequests: false,
      },
      expect.anything()
    );

    const saved = makeDestination({
      config: { serverUrl: "https://ntfy.sh", topic: "mine", accessToken: "" },
      kinds: ["review_new"],
    });
    settle<NotificationDestination[]>(save.mutate, [saved]);
    rerender(<ChannelPanel channel="ntfy" destination={saved} catalog={makeCatalog()} />);

    expect(toast.success).toHaveBeenCalledWith("ntfy saved");
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.actions.test })).toBeEnabled();
  });

  it("takes the masked secret back after a save, so the form is clean again", () => {
    const { rerender } = render(<ChannelPanel channel="discord" destination={undefined} catalog={makeCatalog()} />);

    fireEvent.change(screen.getByLabelText(copy.fields.webhookUrl.label), {
      target: { value: "https://discord.com/api/webhooks/1/abc" },
    });
    fireEvent.click(screen.getByRole("button", { name: saveBar.save }));
    const masked = makeDestination({ channel: "discord", config: { webhookUrl: "••••••••" }, kinds: [] });
    settle<NotificationDestination[]>(save.mutate, [masked]);
    rerender(<ChannelPanel channel="discord" destination={masked} catalog={makeCatalog()} />);

    expect(screen.getByLabelText(copy.fields.webhookUrl.label)).toHaveValue("••••••••");
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
  });

  it("offers the every-member switch only when the catalog allows it", async () => {
    const { unmount } = render(
      <ChannelPanel channel="discord" destination={undefined} catalog={makeMemberCatalog()} />
    );
    expect(screen.queryByRole("switch", { name: copy.allRequests.label })).not.toBeInTheDocument();
    unmount();

    render(<ChannelPanel channel="discord" destination={undefined} catalog={makeCatalog()} />);
    await userEvent.click(screen.getByRole("switch", { name: copy.allRequests.label }));

    expect(screen.getByRole("switch", { name: copy.allRequests.label })).toBeChecked();
    expect(screen.getByRole("button", { name: saveBar.save })).toBeInTheDocument();
  });

  it("puts the draft back when the change is cancelled", async () => {
    render(<ChannelPanel channel="ntfy" destination={makeDestination()} catalog={makeCatalog()} />);
    const enabled = screen.getByRole("switch", { name: "Send notifications to ntfy" });

    await userEvent.click(enabled);
    expect(enabled).not.toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: saveBar.cancel }));

    expect(enabled).toBeChecked();
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
  });

  it("holds the test back while there are unsaved changes", async () => {
    render(<ChannelPanel channel="ntfy" destination={makeDestination()} catalog={makeCatalog()} />);

    expect(screen.getByRole("button", { name: copy.actions.test })).toBeEnabled();
    await userEvent.click(screen.getByRole("checkbox", { name: copy.kinds.album_failed }));

    expect(screen.getByRole("button", { name: copy.actions.test })).toBeDisabled();
    expect(screen.getByText(copy.actions.saveBeforeTest)).toBeInTheDocument();
  });

  it("confirms a test that arrived", async () => {
    render(<ChannelPanel channel="ntfy" destination={makeDestination()} catalog={makeCatalog()} />);

    await userEvent.click(screen.getByRole("button", { name: copy.actions.test }));
    expect(test.mutate).toHaveBeenCalledWith({ channel: "ntfy" }, expect.anything());
    settle<NotificationTestOutcome>(test.mutate, { ok: true });

    expect(toast.success).toHaveBeenCalledWith("Test sent. Check ntfy.");
  });

  it("names why a test did not arrive", async () => {
    render(<ChannelPanel channel="ntfy" destination={makeDestination()} catalog={makeCatalog()} />);

    await userEvent.click(screen.getByRole("button", { name: copy.actions.test }));
    settle<NotificationTestOutcome>(test.mutate, { ok: false, failure: "unreachable", status: null });

    expect(toast.error).toHaveBeenCalledWith(`The test did not arrive: ${copy.failures.unreachable}`);
  });

  it("shows the sending label while a test is in flight", () => {
    test.isPending = true;
    render(<ChannelPanel channel="ntfy" destination={makeDestination()} catalog={makeCatalog()} />);
    test.isPending = false;

    expect(screen.getByRole("button", { name: copy.actions.testing })).toBeDisabled();
  });

  it("removes a saved destination and starts the form over", async () => {
    render(
      <ChannelPanel channel="ntfy" destination={makeDestination({ kinds: ["review_new"] })} catalog={makeCatalog()} />
    );

    await userEvent.click(screen.getByRole("button", { name: copy.actions.remove }));
    expect(remove.mutate).toHaveBeenCalledWith({ channel: "ntfy" }, expect.anything());
    settle<NotificationDestination[]>(remove.mutate, []);

    expect(screen.getByRole("checkbox", { name: copy.kinds.review_new })).not.toBeChecked();
    expect(screen.getByLabelText(copy.fields.topic.label)).toHaveValue("");
  });
});
