import { afterEach, describe, expect, it, vi } from "vitest";

import type { PublicUser, Role } from "@api/__generated__/types";
import { createMockUser } from "@test/mocks/feature-hooks.mock";
import { renderWithProviders, screen } from "@test/test-utils";

import { RequestSplitButton } from "../RequestSplitButton";

const auth = vi.hoisted(() => {
  const current: { currentUser: PublicUser | null } = { currentUser: null };
  return { current };
});

const CUSTOMIZING_ROLES: Role[] = ["trusted", "admin"];

vi.mock("@modules/providers/AuthProvider", () => ({ useAuthContext: () => auth.current }));

function renderButton(props: Partial<Parameters<typeof RequestSplitButton>[0]> = {}) {
  const onRequest = vi.fn();
  const onCustomize = vi.fn();
  const onParentClick = vi.fn();
  const view = renderWithProviders(
    <div onClick={onParentClick}>
      <RequestSplitButton name="Blue Lines" onRequest={onRequest} onCustomize={onCustomize} {...props} />
    </div>
  );
  return { ...view, onRequest, onCustomize, onParentClick };
}

afterEach(() => {
  auth.current = { currentUser: null };
});

describe("RequestSplitButton", () => {
  it("requests with the preset from the left half without reaching the row underneath", async () => {
    auth.current = { currentUser: createMockUser({ role: "member" }) };
    const { user, onRequest, onParentClick } = renderButton();

    await user.click(screen.getByRole("button", { name: "Request Blue Lines" }));

    expect(onRequest).toHaveBeenCalledTimes(1);
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("gives a member no way to change the settings", () => {
    auth.current = { currentUser: createMockUser({ role: "member" }) };
    renderButton();

    expect(screen.queryByRole("button", { name: "Request Blue Lines with custom settings" })).not.toBeInTheDocument();
  });

  it("hides the settings half until the user is known", () => {
    renderButton();

    expect(screen.queryByRole("button", { name: "Request Blue Lines with custom settings" })).not.toBeInTheDocument();
  });

  it.each(CUSTOMIZING_ROLES)("lets a %s user open the settings from the right half", async (role) => {
    auth.current = { currentUser: createMockUser({ role }) };
    const { user, onRequest, onCustomize, onParentClick } = renderButton();

    await user.click(screen.getByRole("button", { name: "Request Blue Lines with custom settings" }));

    expect(onCustomize).toHaveBeenCalledTimes(1);
    expect(onRequest).not.toHaveBeenCalled();
    expect(onParentClick).not.toHaveBeenCalled();
  });

  it("keeps its visible label at the start of its name and adds the item", () => {
    auth.current = { currentUser: createMockUser({ role: "admin" }) };
    renderButton({ label: "Request album" });

    expect(screen.getByRole("button", { name: "Request album: Blue Lines" })).toBeInTheDocument();
  });

  it("disables both halves and says why", () => {
    auth.current = { currentUser: createMockUser({ role: "admin" }) };
    renderButton({ disabled: true, disabledReason: "Quota reached", dataCy: "split" });

    expect(screen.getByRole("button", { name: "Request Blue Lines" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Request Blue Lines with custom settings" })).toBeDisabled();
    expect(document.querySelector("[data-cy='split']")).toHaveAttribute("title", "Quota reached");
  });
});
