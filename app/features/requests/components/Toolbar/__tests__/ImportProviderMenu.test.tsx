import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@test/test-utils";
import userEvent from "@testing-library/user-event";

import { ImportProviderMenu } from "../ImportProviderMenu";

vi.mock("@features/spotify-library", () => ({
  SpotifyLibraryModal: ({ open }: { open: boolean }) => (open ? <div data-testid="spotify-modal" /> : null),
  SpotifyMark: () => <span data-testid="spotify-mark" />,
}));

vi.mock("@features/jspf-import", () => ({
  JspfImportModal: ({ open }: { open: boolean }) => (open ? <div data-testid="jspf-modal" /> : null),
}));

async function openMenu() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Import library" }));
  return user;
}

describe("ImportProviderMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("always shows the Spotify and From file sources", async () => {
    render(<ImportProviderMenu />);
    await openMenu();

    expect(screen.getByRole("menuitem", { name: /Spotify/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /From file/ })).toBeInTheDocument();
    expect(screen.queryByText("No sources enabled")).not.toBeInTheDocument();
  });

  it("opens the Spotify library modal when the Spotify source is selected", async () => {
    render(<ImportProviderMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: /Spotify/ }));

    expect(await screen.findByTestId("spotify-modal")).toBeInTheDocument();
  });

  it("opens the file import modal when the From file source is selected", async () => {
    render(<ImportProviderMenu />);
    const user = await openMenu();

    await user.click(screen.getByRole("menuitem", { name: /From file/ }));

    expect(await screen.findByTestId("jspf-modal")).toBeInTheDocument();
  });
});
