import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const api = vi.hoisted(() => ({
  accounts: [] as Array<{
    server: string;
    connected: boolean;
    externalUsername: string | null;
    reportEnabled: boolean;
    lastFailure: string | null;
  }>,
  mutate: vi.fn(),
}));

vi.mock("@hooks/api", () => ({
  usePlaybackSourceAccounts: () => ({ data: api.accounts }),
  useSetSourceReporting: () => ({ mutate: api.mutate, isPending: false }),
}));

import { PlexReportingRow } from "../components/PlexReportingRow";

const copy = enSettings.profile.connected.plex.reporting;

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  api.mutate.mockReset();
});

function plex(overrides: Partial<(typeof api.accounts)[number]> = {}) {
  return {
    server: "plex",
    connected: true,
    externalUsername: "plexer",
    reportEnabled: true,
    lastFailure: null,
    ...overrides,
  };
}

describe("PlexReportingRow", () => {
  it("shows nothing while the admin has not turned on playing from Plex", () => {
    api.accounts = [];
    const { container } = render(<PlexReportingRow onRelink={vi.fn()} relinking={false} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("asks to link again when Plex is linked but its token was never kept", async () => {
    api.accounts = [plex({ connected: false, reportEnabled: false })];
    const onRelink = vi.fn();
    render(<PlexReportingRow onRelink={onRelink} relinking={false} />);

    expect(screen.getByText(copy.relinkHint)).toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: copy.relink }));
    expect(onRelink).toHaveBeenCalledTimes(1);
  });

  it("switches recording off for this listener", async () => {
    api.accounts = [plex()];
    render(<PlexReportingRow onRelink={vi.fn()} relinking={false} />);

    await userEvent.setup().click(screen.getByRole("switch", { name: copy.label }));

    expect(api.mutate).toHaveBeenCalledWith({ server: "plex", enabled: false });
  });

  it("says why the last report did not go through", () => {
    api.accounts = [plex({ lastFailure: "unauthorized" })];
    render(<PlexReportingRow onRelink={vi.fn()} relinking={false} />);

    expect(screen.getByText(copy.unauthorized)).toBeInTheDocument();
  });
});
