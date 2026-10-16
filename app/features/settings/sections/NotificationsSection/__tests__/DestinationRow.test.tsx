import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import { draftOf } from "../helpers";
import type { DestinationDraft, DestinationRowProps, NotificationDestination, NotificationTestOutcome } from "../types";
import { makeCatalog, makeDestination, makeMemberCatalog } from "./fixtures";

const save = createMockMutation();
const remove = createMockMutation();
const test = createMockMutation();

vi.mock("@hooks/api", () => ({
  useSaveNotificationDestination: () => save,
  useRemoveNotificationDestination: () => remove,
  useTestNotificationDestination: () => test,
  useRevealNotificationSecret: () => vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { toast } from "sonner";

import { DestinationRow } from "../components/DestinationRow";

const copy = enSettings.notifications;
const saveBar = enSettings.shell.saveBar;

const onToggleOpen = vi.fn();
const onDraftChange = vi.fn();
const onSettled = vi.fn();

interface Callbacks<T> {
  onSuccess: (value: T) => void;
}

function settle<T>(mutate: ReturnType<typeof vi.fn>, value: T) {
  const callbacks: Callbacks<T> = mutate.mock.calls[0][1];
  act(() => callbacks.onSuccess(value));
}

function deferred(): { promise: Promise<undefined>; resolve: () => void } {
  let resolve = () => {};
  const promise = new Promise<undefined>((done) => {
    resolve = () => done(undefined);
  });
  return { promise, resolve };
}

const saved = makeDestination();
const savedDraft = draftOf("ntfy", saved);
const freshDraft = draftOf("ntfy", undefined);

function renderRow(overrides: Partial<DestinationRowProps> = {}) {
  const props: DestinationRowProps = {
    channel: "ntfy",
    destination: saved,
    catalog: makeCatalog(),
    draft: savedDraft,
    baseline: savedDraft,
    open: false,
    onToggleOpen,
    onDraftChange,
    onSettled,
    ...overrides,
  };
  return render(<DestinationRow {...props} />);
}

const enableLabel = () => i18n.t("settings:notifications.enable.label", { channel: copy.channels.ntfy });

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  save.isPending = false;
  test.isPending = false;
  save.mutateAsync.mockResolvedValue(undefined);
});

describe("DestinationRow", () => {
  it("offers to set up a destination that is not configured, with no switch to turn it off", async () => {
    renderRow({ destination: undefined, draft: freshDraft, baseline: freshDraft });

    expect(screen.getByText(copy.channels.ntfy)).toBeInTheDocument();
    expect(screen.queryByRole("switch", { name: enableLabel() })).toBeNull();
    const setUp = screen.getByRole("button", { name: copy.actions.setUp });
    expect(setUp).toHaveAttribute("aria-expanded", "false");

    await userEvent.click(setUp);

    expect(onToggleOpen).toHaveBeenCalledTimes(1);
  });

  it("offers a configured destination for editing, and to close it once open", () => {
    const { rerender } = renderRow();

    expect(screen.getByRole("switch", { name: enableLabel() })).toBeChecked();
    expect(screen.getByRole("button", { name: copy.actions.edit })).toBeInTheDocument();
    expect(screen.queryByLabelText(copy.fields.topic.label)).toBeNull();

    rerender(
      <DestinationRow
        channel="ntfy"
        destination={saved}
        catalog={makeCatalog()}
        draft={savedDraft}
        baseline={savedDraft}
        open
        onToggleOpen={onToggleOpen}
        onDraftChange={onDraftChange}
        onSettled={onSettled}
      />
    );

    expect(screen.getByRole("button", { name: copy.actions.close })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText(copy.fields.topic.label)).toHaveValue("synthseek-probe");
  });

  it("hands a switched-off destination back as a draft change", async () => {
    renderRow();

    await userEvent.click(screen.getByRole("switch", { name: enableLabel() }));

    expect(onDraftChange).toHaveBeenCalledWith({ ...savedDraft, enabled: false });
  });

  it("hands a typed field back as a draft change, keeping the rest of the config", () => {
    renderRow({ open: true });

    fireEvent.change(screen.getByLabelText(copy.fields.topic.label), { target: { value: " mine " } });

    expect(onDraftChange).toHaveBeenCalledWith({ ...savedDraft, config: { ...savedDraft.config, topic: " mine " } });
  });

  it("offers the every-member switch only when the catalog allows it", async () => {
    const { unmount } = renderRow({ open: true, catalog: makeMemberCatalog() });
    expect(screen.queryByRole("switch", { name: copy.allRequests.label })).toBeNull();
    unmount();

    renderRow({ open: true });
    await userEvent.click(screen.getByRole("switch", { name: copy.allRequests.label }));

    expect(onDraftChange).toHaveBeenCalledWith({ ...savedDraft, allRequests: true });
  });

  it("shows no save bar while the draft matches what is stored", () => {
    renderRow({ open: true });

    expect(screen.queryByRole("button", { name: saveBar.save })).toBeNull();
  });

  it("holds the save back until every required field is filled in", () => {
    const blankTopic: DestinationDraft = { ...freshDraft, kinds: ["review_new"] };
    renderRow({ destination: undefined, draft: blankTopic, baseline: freshDraft, open: true });

    expect(screen.getByRole("button", { name: saveBar.save })).toBeDisabled();
  });

  it("saves the draft trimmed, and settles and confirms only once the save has landed", async () => {
    const pending = deferred();
    save.mutateAsync.mockReturnValueOnce(pending.promise);
    const draft: DestinationDraft = {
      ...freshDraft,
      config: { ...freshDraft.config, topic: " mine " },
      kinds: ["review_new"],
    };
    renderRow({ destination: undefined, draft, baseline: freshDraft, open: true });

    await userEvent.click(screen.getByRole("button", { name: saveBar.save }));

    expect(save.mutateAsync).toHaveBeenCalledWith({
      channel: "ntfy",
      enabled: true,
      config: { serverUrl: "https://ntfy.sh", topic: "mine", accessToken: "" },
      kinds: ["review_new"],
      allRequests: false,
    });
    expect(onSettled).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();

    await act(async () => pending.resolve());

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(i18n.t("settings:notifications.saved", { channel: "ntfy" }));
  });

  it("drops the draft when the change is cancelled", async () => {
    renderRow({ draft: { ...savedDraft, enabled: false } });

    await userEvent.click(screen.getByRole("button", { name: saveBar.cancel }));

    expect(onSettled).toHaveBeenCalledTimes(1);
    expect(save.mutateAsync).not.toHaveBeenCalled();
  });

  it("offers no test or removal for a destination that is not configured yet", () => {
    renderRow({ destination: undefined, draft: freshDraft, baseline: freshDraft, open: true });

    expect(screen.queryByRole("button", { name: copy.actions.test })).toBeNull();
    expect(screen.queryByRole("button", { name: copy.actions.remove })).toBeNull();
  });

  it("holds the test back while there are unsaved changes", () => {
    renderRow({ open: true, draft: { ...savedDraft, kinds: ["album_failed"] } });

    expect(screen.getByRole("button", { name: copy.actions.test })).toBeDisabled();
    expect(screen.getByText(copy.actions.saveBeforeTest)).toBeInTheDocument();
  });

  it("confirms a test that arrived", async () => {
    renderRow({ open: true });

    await userEvent.click(screen.getByRole("button", { name: copy.actions.test }));
    expect(test.mutate).toHaveBeenCalledWith({ channel: "ntfy" }, expect.anything());
    settle<NotificationTestOutcome>(test.mutate, { ok: true });

    expect(toast.success).toHaveBeenCalledWith(i18n.t("settings:notifications.test.sent", { channel: "ntfy" }));
  });

  it("names why a test did not arrive", async () => {
    renderRow({ open: true });

    await userEvent.click(screen.getByRole("button", { name: copy.actions.test }));
    settle<NotificationTestOutcome>(test.mutate, { ok: false, failure: "unreachable", status: null });

    expect(toast.error).toHaveBeenCalledWith(
      i18n.t("settings:notifications.test.failed", { reason: copy.failures.unreachable })
    );
  });

  it("shows the sending label while a test is in flight", () => {
    test.isPending = true;
    renderRow({ open: true });

    expect(screen.getByRole("button", { name: copy.actions.testing })).toBeDisabled();
  });

  it("removes a saved destination and settles the row once it is gone", async () => {
    renderRow({ open: true });

    await userEvent.click(screen.getByRole("button", { name: copy.actions.remove }));
    expect(remove.mutate).toHaveBeenCalledWith({ channel: "ntfy" }, expect.anything());
    expect(onSettled).not.toHaveBeenCalled();

    settle<NotificationDestination[]>(remove.mutate, []);

    expect(onSettled).toHaveBeenCalledTimes(1);
  });
});
