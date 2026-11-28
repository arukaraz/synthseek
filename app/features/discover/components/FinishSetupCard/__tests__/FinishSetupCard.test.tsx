import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import "@test/mocks/next.mock";
import enDiscover from "@modules/i18n/messages/en/discover.json";

import { FinishSetupCard } from "../FinishSetupCard";

interface Pending {
  items: ("mediaServer" | "downloadSource" | "musicbrainzContact")[];
  count: number;
  dismissed: boolean;
}

const api = vi.hoisted(() => ({
  isAdmin: { value: true },
  pending: { value: undefined as unknown },
  enabledSeen: [] as boolean[],
  dismiss: vi.fn(),
  dismissing: { value: false },
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: api.isAdmin.value }),
}));

vi.mock("@hooks/api/queries/setup/useSetupPending", () => ({
  useSetupPending: ({ enabled }: { enabled: boolean }) => {
    api.enabledSeen.push(enabled);
    return { data: enabled ? api.pending.value : undefined };
  },
}));

vi.mock("@hooks/api/mutations/setup/useDismissSetupPending", () => ({
  useDismissSetupPending: () => ({ mutate: api.dismiss, isPending: api.dismissing.value }),
}));

function pendingIs(pending: Pending | undefined) {
  api.pending.value = pending;
}

const titleName = enDiscover.finishSetup.title;

beforeEach(() => {
  vi.clearAllMocks();
  api.isAdmin.value = true;
  api.dismissing.value = false;
  api.enabledSeen.length = 0;
  pendingIs({ items: ["mediaServer", "downloadSource", "musicbrainzContact"], count: 3, dismissed: false });
});

describe("for an admin with things left to set up", () => {
  it("shows one row per pending item, each linking to its exact Settings card", () => {
    render(<FinishSetupCard />);

    const list = screen.getByRole("list", { name: enDiscover.finishSetup.listLabel });
    const links = within(list).getAllByRole("link");

    expect(links.map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      [
        `${enDiscover.finishSetup.items.mediaServer}${enDiscover.finishSetup.setUp}`,
        "/settings/library/sources?server=plex#plex",
      ],
      [
        `${enDiscover.finishSetup.items.downloadSource}${enDiscover.finishSetup.setUp}`,
        "/settings/download/sources?source=slskd#slskd",
      ],
      [
        `${enDiscover.finishSetup.items.musicbrainzContact}${enDiscover.finishSetup.setUp}`,
        "/settings/metadata#connections.enrichment.musicbrainzEmail",
      ],
    ]);
  });

  it("lists only what is still pending and counts what is done", () => {
    pendingIs({ items: ["downloadSource"], count: 1, dismissed: false });
    render(<FinishSetupCard />);

    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByText("2 of 3")).toBeInTheDocument();
  });

  it("counts none done when everything is pending", () => {
    render(<FinishSetupCard />);

    expect(screen.getByText("0 of 3")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: titleName })).toBeInTheDocument();
  });

  it("hides the card for now when asked", async () => {
    render(<FinishSetupCard />);

    await userEvent.click(screen.getByRole("button", { name: enDiscover.finishSetup.hide }));

    expect(api.dismiss).toHaveBeenCalledTimes(1);
  });

  it("holds the hide button while the server answers", () => {
    api.dismissing.value = true;
    render(<FinishSetupCard />);

    expect(screen.getByRole("button", { name: enDiscover.finishSetup.hide })).toBeDisabled();
  });
});

describe("when it must not show", () => {
  it("renders nothing once it is hidden", () => {
    pendingIs({ items: ["mediaServer"], count: 1, dismissed: true });
    const { container } = render(<FinishSetupCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when nothing is pending", () => {
    pendingIs({ items: [], count: 0, dismissed: false });
    const { container } = render(<FinishSetupCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing until the server has answered", () => {
    pendingIs(undefined);
    const { container } = render(<FinishSetupCard />);

    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing for a member and never asks the server for the list", () => {
    api.isAdmin.value = false;
    const { container } = render(<FinishSetupCard />);

    expect(container).toBeEmptyDOMElement();
    expect(api.enabledSeen.every((enabled) => !enabled)).toBe(true);
  });
});
