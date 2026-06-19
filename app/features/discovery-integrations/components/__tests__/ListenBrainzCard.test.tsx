import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from "vitest";

import i18n from "@modules/i18n";
import enComponents from "@modules/i18n/messages/en/components.json";
import enLibrary from "@modules/i18n/messages/en/library.json";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { createMockMutation } from "@test/mocks/trpc.mock";

import type { LbConfig } from "../../types";
import { ListenBrainzCard } from "../ListenBrainzCard";

const mutation = createMockMutation();

vi.mock("@hooks/api/mutations/discovery/useUpdateListenBrainz", () => ({
  useUpdateListenBrainz: () => mutation,
}));

beforeAll(() => {
  i18n.addResourceBundle("en", "library", enLibrary, true, true);
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
  i18n.addResourceBundle("en", "components", enComponents, true, true);
});

beforeEach(() => {
  mutation.mutate.mockReset();
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const lb = enLibrary.discoveryIntegrations.listenbrainz;

function makeConfig(overrides: Partial<LbConfig> = {}): LbConfig {
  return {
    enabled: true,
    username: "tester",
    selectedKinds: ["weekly-jams"],
    autoRequest: false,
    replaceExistingPlaylist: false,
    ...overrides,
  };
}

function replaceSwitch() {
  return screen.getByRole("switch", { name: lb.replacePlaylistAria });
}

describe("ListenBrainzCard replace-playlist switch", () => {
  it("disables the replace-playlist switch when auto-request is off", () => {
    render(<ListenBrainzCard config={makeConfig({ autoRequest: false })} />);

    expect(replaceSwitch()).toBeDisabled();
  });

  it("enables the replace-playlist switch when auto-request is on", () => {
    render(<ListenBrainzCard config={makeConfig({ autoRequest: true })} />);

    expect(replaceSwitch()).not.toBeDisabled();
  });

  it("re-enables the replace-playlist switch the moment auto-request is toggled on, with no save", async () => {
    render(<ListenBrainzCard config={makeConfig({ autoRequest: false })} />);

    expect(replaceSwitch()).toBeDisabled();
    await userEvent.click(screen.getByRole("switch", { name: lb.autoRequestAria }));

    expect(replaceSwitch()).not.toBeDisabled();
    expect(mutation.mutate).not.toHaveBeenCalled();
  });

  it("includes replaceExistingPlaylist in the save payload when toggled on", async () => {
    render(<ListenBrainzCard config={makeConfig({ autoRequest: true })} />);

    await userEvent.click(replaceSwitch());
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ autoRequest: true, replaceExistingPlaylist: true })
    );
  });

  it("renders the localized label and helper copy", () => {
    render(<ListenBrainzCard config={makeConfig({ autoRequest: true })} />);

    const row = replaceSwitch().closest("div");
    expect(row).not.toBeNull();
    if (row) {
      expect(within(row).getByText(lb.replacePlaylistLabel)).toBeInTheDocument();
      expect(within(row).getByText(lb.replacePlaylistHelper)).toBeInTheDocument();
    }
  });
});

const playlistKind = enLibrary.discoveryIntegrations.playlistKind;

describe("ListenBrainzCard playlist rename inputs", () => {
  it("reveals a rename input only for each enabled kind", () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: ["weekly-jams"] })} />);

    expect(screen.getByRole("textbox", { name: playlistKind.weeklyJamsLabel })).toBeInTheDocument();
    expect(screen.queryByRole("textbox", { name: playlistKind.cfRecommendationsLabel })).toBeNull();
    expect(screen.queryByRole("textbox", { name: playlistKind.dailyJamsLabel })).toBeNull();
  });

  it("hides the rename section entirely when no kind is enabled", () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: [] })} />);

    expect(screen.queryByText(lb.renamePlaylistLabel)).toBeNull();
  });

  it("reveals a kind's rename input the moment its chip is enabled", async () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: ["weekly-jams"] })} />);

    expect(screen.queryByRole("textbox", { name: playlistKind.cfRecommendationsLabel })).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: playlistKind.cfRecommendationsLabel }));

    expect(screen.getByRole("textbox", { name: playlistKind.cfRecommendationsLabel })).toBeInTheDocument();
  });

  it("seeds the input from the saved custom name", () => {
    render(
      <ListenBrainzCard
        config={makeConfig({ selectedKinds: ["weekly-jams"], playlistNames: { "weekly-jams": "My Jams" } })}
      />
    );

    expect(screen.getByRole("textbox", { name: playlistKind.weeklyJamsLabel })).toHaveValue("My Jams");
  });

  it("uses the default kind label as the input placeholder", () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: ["cf-recommendations"] })} />);

    expect(screen.getByRole("textbox", { name: playlistKind.cfRecommendationsLabel })).toHaveAttribute(
      "placeholder",
      playlistKind.cfRecommendationsLabel
    );
  });

  it("includes the typed custom name in the save payload, trimmed and keyed by kind", async () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: ["weekly-jams"] })} />);

    await userEvent.type(screen.getByRole("textbox", { name: playlistKind.weeklyJamsLabel }), "  Road Trip  ");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ playlistNames: { "weekly-jams": "Road Trip" } })
    );
  });

  it("omits an empty input from the playlistNames patch", async () => {
    render(<ListenBrainzCard config={makeConfig({ selectedKinds: ["weekly-jams"] })} />);

    await userEvent.click(screen.getByRole("button", { name: playlistKind.dailyJamsLabel }));
    await userEvent.type(screen.getByRole("textbox", { name: playlistKind.weeklyJamsLabel }), "Keepers");
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(mutation.mutate).toHaveBeenCalledWith(
      expect.objectContaining({ playlistNames: { "weekly-jams": "Keepers" } })
    );
  });
});
