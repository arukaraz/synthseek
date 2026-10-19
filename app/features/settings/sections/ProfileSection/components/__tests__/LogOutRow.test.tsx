import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, waitFor } from "@test/test-utils";

import { LogOutRow } from "../LogOutRow";

const { mutateAsync, replace, logoutState } = vi.hoisted(() => ({
  mutateAsync: vi.fn<() => Promise<void>>(),
  replace: vi.fn<(href: string) => void>(),
  logoutState: { isPending: false },
}));

vi.mock("@hooks/api/mutations/auth/useLogout", () => ({
  useLogout: () => ({ mutateAsync, isPending: logoutState.isPending }),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, push: vi.fn() }) }));

afterEach(() => {
  vi.clearAllMocks();
  logoutState.isPending = false;
});

describe("LogOutRow", () => {
  it("logs out and sends the browser to the login page", async () => {
    mutateAsync.mockResolvedValue(undefined);
    renderWithProviders(<LogOutRow />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("still leaves for the login page when the server call fails", async () => {
    mutateAsync.mockRejectedValue(new Error("offline"));
    renderWithProviders(<LogOutRow />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("shows the pending state and refuses a second press", () => {
    logoutState.isPending = true;
    renderWithProviders(<LogOutRow />);

    const button = screen.getByRole("button", { name: "Logging out…" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("is a search target in settings, anchored on its own row", () => {
    const { container } = renderWithProviders(<LogOutRow />);

    expect(container.querySelector("[data-anchor-target='account.logout']")).not.toBeNull();
  });
});
