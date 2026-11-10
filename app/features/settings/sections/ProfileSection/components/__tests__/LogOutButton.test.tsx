import { afterEach, describe, expect, it, vi } from "vitest";

import { fireEvent, renderWithProviders, screen, waitFor } from "@test/test-utils";

import { LogOutButton } from "../LogOutButton";

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

describe("LogOutButton", () => {
  it("logs out and sends the browser to the login page", async () => {
    mutateAsync.mockResolvedValue(undefined);
    renderWithProviders(<LogOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("still leaves for the login page when the server call fails", async () => {
    mutateAsync.mockRejectedValue(new Error("offline"));
    renderWithProviders(<LogOutButton />);

    fireEvent.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/login"));
  });

  it("shows the pending state and refuses a second press", () => {
    logoutState.isPending = true;
    renderWithProviders(<LogOutButton />);

    const button = screen.getByRole("button", { name: "Logging out…" });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("is the settings search target for logging out, the anchor on the button itself rather than on a field around it", () => {
    renderWithProviders(<LogOutButton />);

    const button = screen.getByRole("button", { name: "Log out" });
    expect(button).toHaveAttribute("data-anchor-target", "account.logout");
    expect(button.closest("[data-anchor-target]")).toBe(button);
  });
});
