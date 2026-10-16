import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import {
  createErrorQuery,
  createLoadingQuery,
  createMockMutation,
  createMockQuery,
  type MockQueryResult,
} from "@test/mocks/trpc.mock";

import type { NotificationCatalog, NotificationChannel, NotificationDestination } from "../types";
import { makeCatalog, makeDestination, makeMemberCatalog } from "./fixtures";

let catalog: MockQueryResult<NotificationCatalog> = createMockQuery(makeCatalog());
let destinations: MockQueryResult<NotificationDestination[]> = createMockQuery<NotificationDestination[]>([]);
const save = createMockMutation();

vi.mock("@hooks/api", () => ({
  useNotificationCatalog: () => catalog,
  useNotificationDestinations: () => destinations,
  useSaveNotificationDestination: () => save,
  useRemoveNotificationDestination: () => createMockMutation(),
  useTestNotificationDestination: () => createMockMutation(),
  useRevealNotificationSecret: () => vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

import { NotificationDestinations } from "../components/NotificationDestinations";

const copy = enSettings.notifications;
const ALL_CHANNELS: NotificationChannel[] = ["discord", "ntfy", "telegram", "webhook", "apprise"];

const presetsFor = (channel: NotificationChannel) =>
  i18n.t("settings:notifications.matrix.presetsFor", { channel: copy.channels[channel] });

function matrixColumns(): NotificationChannel[] {
  return screen
    .queryAllByRole("button")
    .map((button) => ALL_CHANNELS.find((channel) => button.getAttribute("aria-label") === presetsFor(channel)))
    .filter((channel) => channel !== undefined);
}

function rowNames(): string[] {
  const names = new Set(ALL_CHANNELS.map((channel) => copy.channels[channel]));
  return screen
    .getAllByText((_, element) => element !== null && element.tagName === "P" && names.has(element.textContent ?? ""))
    .map((element) => element.textContent ?? "");
}

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  save.mutateAsync.mockResolvedValue(undefined);
  catalog = createMockQuery(makeCatalog());
  destinations = createMockQuery<NotificationDestination[]>([]);
});

describe("NotificationDestinations", () => {
  it("lists a destination row for every channel the catalog allows, each ready to be set up", () => {
    render(<NotificationDestinations />);

    expect(rowNames()).toEqual(ALL_CHANNELS.map((channel) => copy.channels[channel]));
    expect(screen.getAllByRole("button", { name: copy.actions.setUp })).toHaveLength(5);
  });

  it("shows a member only the fixed-host channels", () => {
    catalog = createMockQuery(makeMemberCatalog());
    render(<NotificationDestinations />);

    expect(rowNames()).toEqual([copy.channels.discord, copy.channels.ntfy, copy.channels.telegram]);
  });

  it("opens one destination at a time", async () => {
    render(<NotificationDestinations />);
    const [discord, , telegram] = screen.getAllByRole("button", { name: copy.actions.setUp });

    await userEvent.click(discord);
    expect(screen.getByLabelText(copy.fields.webhookUrl.label)).toBeInTheDocument();

    await userEvent.click(telegram);
    expect(screen.queryByLabelText(copy.fields.webhookUrl.label)).toBeNull();
    expect(screen.getByLabelText(copy.fields.botToken.label)).toBeInTheDocument();

    await userEvent.click(telegram);
    expect(screen.queryByLabelText(copy.fields.botToken.label)).toBeNull();
  });

  it("loads a saved destination into its row when it is opened for editing", async () => {
    destinations = createMockQuery<NotificationDestination[]>([
      makeDestination({ config: { serverUrl: "https://ntfy.sh", topic: "saved-topic", accessToken: "" } }),
    ]);
    render(<NotificationDestinations />);

    await userEvent.click(screen.getByRole("button", { name: copy.actions.edit }));

    expect(screen.getByLabelText(copy.fields.topic.label)).toHaveValue("saved-topic");
  });

  it("explains that nothing can be chosen until a destination is set up", () => {
    render(<NotificationDestinations />);

    expect(screen.getByText(copy.matrix.empty)).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
  });

  it("gives the matrix a column only for the destinations that are configured", () => {
    destinations = createMockQuery<NotificationDestination[]>([
      makeDestination(),
      makeDestination({ channel: "telegram", configured: false, config: { botToken: "", chatId: "" }, kinds: [] }),
    ]);
    render(<NotificationDestinations />);

    expect(matrixColumns()).toEqual(["ntfy"]);
    expect(screen.queryByText(copy.matrix.empty)).toBeNull();
  });

  it("adds a column for a destination being set up as soon as its required fields are filled in", async () => {
    render(<NotificationDestinations />);
    const [discord] = screen.getAllByRole("button", { name: copy.actions.setUp });
    await userEvent.click(discord);
    expect(matrixColumns()).toEqual([]);

    fireEvent.change(screen.getByLabelText(copy.fields.webhookUrl.label), {
      target: { value: "https://discord.com/api/webhooks/1/abc" },
    });

    expect(matrixColumns()).toEqual(["discord"]);
  });

  it("carries a choice made in the matrix into the destination's own save", async () => {
    destinations = createMockQuery<NotificationDestination[]>([makeDestination({ kinds: [] })]);
    render(<NotificationDestinations />);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull();

    await userEvent.click(
      screen.getByRole("checkbox", {
        name: i18n.t("settings:notifications.matrix.categoryTo", {
          category: copy.categories.maintenance,
          channel: copy.channels.ntfy,
        }),
      })
    );
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(save.mutateAsync).toHaveBeenCalledWith(
      expect.objectContaining({ channel: "ntfy", kinds: ["review_new", "quarantine_new"] })
    );
    await waitFor(() => expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).toBeNull());
  });

  it("waits for both the catalog and the destinations", () => {
    destinations = createLoadingQuery<NotificationDestination[]>();
    render(<NotificationDestinations />);

    expect(screen.queryByText(copy.destinations.title)).toBeNull();
    expect(screen.queryByText(copy.destinations.unavailable)).toBeNull();
  });

  it("says so when the settings could not be loaded", () => {
    catalog = createErrorQuery<NotificationCatalog>(new Error("down"));
    render(<NotificationDestinations />);

    expect(screen.getByText(copy.destinations.unavailable)).toBeInTheDocument();
  });
});
