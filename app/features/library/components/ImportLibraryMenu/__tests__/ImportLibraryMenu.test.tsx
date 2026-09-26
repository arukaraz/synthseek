import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import type { LibrarySourceDescription } from "@hooks/api/queries/library-source/types";
import enLibrary from "@modules/i18n/messages/en/library.json";

const state = vi.hoisted(() => ({ sources: undefined as LibrarySourceDescription[] | undefined }));

vi.mock("@hooks/api/queries/library-source/useLibrarySources", () => ({
  useLibrarySources: () => ({ data: state.sources }),
}));

vi.mock("@components/LibrarySourceModal", () => ({
  LibrarySourceModal: ({ provider, open }: { provider: string; open: boolean }) =>
    open ? <div data-testid="source-modal" data-provider={provider} /> : null,
  ProviderMark: ({ provider }: { provider: string }) => <span data-testid={`mark-${provider}`} />,
  providerTone: () => "",
}));

vi.mock("@features/jspf-import", () => ({
  JspfImportModal: ({ open }: { open: boolean }) => (open ? <div data-testid="jspf-modal" /> : null),
}));

vi.mock("@features/drop-import", () => ({
  DropImportModal: ({ open }: { open: boolean }) => (open ? <div data-testid="drop-modal" /> : null),
}));

import { ImportLibraryMenu } from "../ImportLibraryMenu";

const labels = enLibrary.page.toolbar.import;

function spotify(overrides: Partial<LibrarySourceDescription> = {}): LibrarySourceDescription {
  return {
    provider: "spotify",
    name: "Spotify",
    configured: true,
    connected: false,
    pending: false,
    externalUsername: null,
    capabilities: {
      connect: "oauth",
      itemTypes: ["playlist", "album", "liked"],
      watch: { playlists: true, savedAlbums: true },
    },
    ...overrides,
  };
}

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: labels.trigger }));
  return user;
}

describe("ImportLibraryMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.sources = [spotify()];
  });

  it("lists each configured source under Sources and both file imports under Files", async () => {
    render(<ImportLibraryMenu />);
    await openMenu();

    expect(screen.getByText(labels.sourcesLabel)).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Spotify" })).toBeInTheDocument();
    expect(screen.getByText(labels.filesLabel)).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: labels.playlist })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: labels.audio })).toBeInTheDocument();
  });

  it("leaves out a source the admin has not configured, and the Sources heading with it", async () => {
    state.sources = [spotify({ configured: false })];

    render(<ImportLibraryMenu />);
    await openMenu();

    expect(screen.queryByRole("menuitem", { name: "Spotify" })).not.toBeInTheDocument();
    expect(screen.queryByText(labels.sourcesLabel)).not.toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: labels.playlist })).toBeInTheDocument();
  });

  it("opens the library modal for the source that was picked", async () => {
    render(<ImportLibraryMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: "Spotify" }));

    expect(await screen.findByTestId("source-modal")).toHaveAttribute("data-provider", "spotify");
  });

  it("opens the playlist import modal from Files", async () => {
    render(<ImportLibraryMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: labels.playlist }));

    expect(await screen.findByTestId("jspf-modal")).toBeInTheDocument();
  });

  it("opens the audio import modal from Files", async () => {
    render(<ImportLibraryMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: labels.audio }));

    expect(await screen.findByTestId("drop-modal")).toBeInTheDocument();
  });
});
