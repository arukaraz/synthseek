import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import { createMockSettings } from "@test/mocks/feature-hooks.mock";

type Settings = ReturnType<typeof createMockSettings>;

interface State {
  push: Mock;
  router: { push: Mock };
  settings: Settings | undefined;
}

const state = vi.hoisted((): State => {
  const push = vi.fn();
  return { push, router: { push }, settings: undefined };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/overview",
  useRouter: () => state.router,
}));

vi.mock("@hooks/api/queries/useSettings", () => ({
  useSettings: () => ({ data: state.settings }),
}));

vi.mock("@hooks/api/queries/useDownloadSourcesAvailability", () => ({
  useDownloadSourcesAvailability: () => ({ data: undefined }),
}));

import { SetupChecklistCard } from "../components/SetupChecklistCard";

const t = i18n.getFixedT("en", "settings");

function halfDone(): Settings {
  const settings = createMockSettings();
  settings.connections.plex = { url: "http://plex", token: "token" };
  settings.connections.enrichment.acoustidApiKey = "acoustid";
  return settings;
}

beforeEach(() => {
  state.push.mockReset();
  state.settings = halfDone();
});

describe("SetupChecklistCard", () => {
  it("renders nothing until the settings arrive", () => {
    state.settings = undefined;
    const { container } = render(<SetupChecklistCard />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows how many checks are done", () => {
    render(<SetupChecklistCard />);
    expect(screen.getByRole("heading", { name: t("overview.setup.title") })).toBeInTheDocument();
    expect(screen.getByText(t("overview.setup.progress", { done: 2, total: 4 }))).toBeInTheDocument();
    expect(screen.getByTestId("progress-bar")).toHaveAttribute("data-progress", "50");
  });

  it("lists every check", () => {
    render(<SetupChecklistCard />);
    for (const key of [
      "overview.setup.downloadSource",
      "overview.setup.mediaServer",
      "overview.setup.musicbrainzEmail",
      "overview.setup.acoustidKey",
    ] as const) {
      expect(screen.getByText(t(key))).toBeInTheDocument();
    }
  });

  it("offers a set up button only for the unfinished checks", () => {
    render(<SetupChecklistCard />);
    const buttons = screen.getAllByRole("button", { name: t("overview.setup.action") });
    expect(buttons).toHaveLength(2);
    expect(buttons[0].parentElement).toHaveTextContent(t("overview.setup.downloadSource"));
    expect(buttons[1].parentElement).toHaveTextContent(t("overview.setup.musicbrainzEmail"));
  });

  it("opens where an unfinished check is fixed", async () => {
    render(<SetupChecklistCard />);
    const buttons = screen.getAllByRole("button", { name: t("overview.setup.action") });
    await userEvent.click(buttons[1]);
    expect(state.push).toHaveBeenCalledWith("/settings/metadata#connections.enrichment.musicbrainzEmail");
  });
});
