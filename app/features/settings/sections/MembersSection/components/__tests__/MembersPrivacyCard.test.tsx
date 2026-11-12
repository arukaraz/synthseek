import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import type { ServerPrivacy } from "../../types";

const copy = enSettings.privacy;

interface PrivacyCardState {
  server: ServerPrivacy | undefined;
  updateServer: ReturnType<typeof vi.fn>;
}

const state = vi.hoisted<PrivacyCardState>(() => ({
  server: undefined,
  updateServer: vi.fn(async () => undefined),
}));

vi.mock("@hooks/api", () => ({
  usePrivacyOverview: () => ({ data: state.server === undefined ? undefined : { server: state.server } }),
  useUpdateServerPrivacy: () => ({ mutateAsync: state.updateServer, isPending: false }),
}));

import { MembersPrivacyCard } from "../MembersPrivacyCard";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

beforeEach(() => {
  vi.clearAllMocks();
  state.server = { membersSeeRequests: true, defaultPlaylistVisibility: "shared", nowPlayingEnabled: true };
});

afterEach(cleanup);

describe("MembersPrivacyCard", () => {
  it("is titled Privacy and carries no admin badge", () => {
    render(<MembersPrivacyCard />);

    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(new RegExp(`^${copy.server.title}$`));
    expect(screen.queryByText(enSettings.shell.card.admin)).not.toBeInTheDocument();
  });

  it("offers no save until something changed, then saves the whole draft", async () => {
    render(<MembersPrivacyCard />);
    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("switch", { name: copy.server.requests.label }));
    await userEvent.click(screen.getByRole("radio", { name: copy.playlists.private }));
    await userEvent.click(screen.getByRole("switch", { name: copy.server.nowPlaying.label }));
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(state.updateServer).toHaveBeenCalledWith({
      membersSeeRequests: false,
      defaultPlaylistVisibility: "private",
      nowPlayingEnabled: false,
    });
  });

  it("drops the draft on cancel and changes nothing on the server", async () => {
    render(<MembersPrivacyCard />);

    const toggle = screen.getByRole("switch", { name: copy.server.requests.label });
    await userEvent.click(toggle);
    expect(toggle).not.toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(toggle).toBeChecked();
    expect(state.updateServer).not.toHaveBeenCalled();
  });

  it("offers no save for a change that was undone by hand", async () => {
    render(<MembersPrivacyCard />);

    const toggle = screen.getByRole("switch", { name: copy.server.nowPlaying.label });
    await userEvent.click(toggle);
    await userEvent.click(toggle);

    expect(screen.queryByRole("button", { name: enSettings.shell.saveBar.save })).not.toBeInTheDocument();
  });

  it("waits for the saved settings before it draws", () => {
    state.server = undefined;

    const { container } = render(<MembersPrivacyCard />);

    expect(container).toBeEmptyDOMElement();
  });
});
