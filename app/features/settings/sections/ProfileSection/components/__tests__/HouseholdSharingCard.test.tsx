import { afterEach, describe, expect, it, vi } from "vitest";

import { createMockUser } from "@test/mocks/feature-hooks.mock";
import { fireEvent, render, screen } from "@test/test-utils";

import { HouseholdSharingCard } from "../HouseholdSharingCard";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

vi.mock("@hooks/api/mutations/auth/useUpdateProfile", () => ({
  useUpdateProfile: () => ({ mutate, isPending: false }),
}));

afterEach(() => {
  vi.clearAllMocks();
});

describe("HouseholdSharingCard", () => {
  it("starts off and turns sharing on through the profile", () => {
    render(<HouseholdSharingCard user={createMockUser()} />);
    const toggle = screen.getByRole("switch", { name: "Share my listening with the household" });
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);

    expect(mutate).toHaveBeenCalledWith({ shareListening: true });
  });

  it("turns sharing off when it was on", () => {
    render(<HouseholdSharingCard user={{ ...createMockUser(), shareListening: true }} />);
    fireEvent.click(screen.getByRole("switch", { name: "Share my listening with the household" }));
    expect(mutate).toHaveBeenCalledWith({ shareListening: false });
  });
});
