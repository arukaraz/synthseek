import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
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

import type { NotificationCatalog, NotificationDestination } from "../types";
import { makeCatalog, makeDestination, makeMemberCatalog } from "./fixtures";

let catalog: MockQueryResult<NotificationCatalog> = createMockQuery(makeCatalog());
let destinations: MockQueryResult<NotificationDestination[]> = createMockQuery<NotificationDestination[]>([]);

vi.mock("@hooks/api", () => ({
  useNotificationCatalog: () => catalog,
  useNotificationDestinations: () => destinations,
  useSaveNotificationDestination: () => createMockMutation(),
  useRemoveNotificationDestination: () => createMockMutation(),
  useTestNotificationDestination: () => createMockMutation(),
  useRevealNotificationSecret: () => vi.fn(),
}));

import { NotificationDestinations } from "../components/NotificationDestinations";

const copy = enSettings.notifications;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  catalog = createMockQuery(makeCatalog());
  destinations = createMockQuery<NotificationDestination[]>([]);
});

describe("NotificationDestinations", () => {
  it("gives every channel the catalog allows its own tab, starting on the first", () => {
    render(<NotificationDestinations />);

    expect(screen.getAllByRole("tab").map((tab) => tab.textContent)).toEqual([
      "Discord",
      "ntfy",
      "Telegram",
      "Webhook",
      "Apprise",
    ]);
    expect(screen.getByRole("tab", { name: "Discord" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(copy.channelHelp.discord)).toBeInTheDocument();
  });

  it("shows a member only the fixed-host channels", () => {
    catalog = createMockQuery(makeMemberCatalog());
    render(<NotificationDestinations />);

    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.queryByRole("tab", { name: "Webhook" })).not.toBeInTheDocument();
  });

  it("switches to the chosen channel and loads its saved destination", async () => {
    destinations = createMockQuery<NotificationDestination[]>([
      makeDestination({ config: { serverUrl: "https://ntfy.sh", topic: "saved-topic", accessToken: "" } }),
    ]);
    render(<NotificationDestinations />);

    await userEvent.click(screen.getByRole("tab", { name: "ntfy" }));

    expect(screen.getByRole("tab", { name: "ntfy" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByLabelText(copy.fields.topic.label)).toHaveValue("saved-topic");
  });

  it("waits for both the catalog and the destinations", () => {
    destinations = createLoadingQuery<NotificationDestination[]>();
    render(<NotificationDestinations />);

    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    expect(screen.queryByText(copy.destinations.unavailable)).not.toBeInTheDocument();
  });

  it("says so when the settings could not be loaded", () => {
    catalog = createErrorQuery<NotificationCatalog>(new Error("down"));
    render(<NotificationDestinations />);

    expect(screen.getByText(copy.destinations.unavailable)).toBeInTheDocument();
  });
});
