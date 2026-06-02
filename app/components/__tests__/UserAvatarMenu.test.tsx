import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatarMenu } from "../UserAvatarMenu";

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({
    currentUser: {
      id: "user_1",
      username: "test-user",
      email: "test@example.com",
      role: "admin",
      avatar_url: null,
    },
    isAdmin: true,
    isLoading: false,
  }),
}));

vi.mock("@hooks/api/subscriptions", () => ({
  useVersionState: () => ({
    latestVersion: null,
    currentVersion: "1.0.0",
    updateAvailable: false,
  }),
}));

vi.mock("@hooks/api/mutations/auth/useLogout", () => ({
  useLogout: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock("framer-motion", async () => {
  const actual = await vi.importActual("framer-motion");
  return {
    ...actual,
    motion: {
      button: ({ children, className, ...props }: React.ComponentProps<"button">) => (
        <button className={className} {...props}>
          {children}
        </button>
      ),
      div: ({ children, className, ...props }: React.ComponentProps<"div">) => (
        <div className={className} {...props}>
          {children}
        </div>
      ),
      span: ({ children, className, ...props }: React.ComponentProps<"span">) => (
        <span className={className} {...props}>
          {children}
        </span>
      ),
    },
  };
});

describe("UserAvatarMenu", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders trigger button with aria-label", () => {
    render(<UserAvatarMenu />);

    expect(screen.getByLabelText("User menu")).toBeInTheDocument();
  });

  it("renders trigger button as button element", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    expect(trigger.tagName).toBe("BUTTON");
  });

  it("has correct button type", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    expect(trigger).toHaveAttribute("type", "button");
  });

  it("has aria-haspopup attribute for accessibility", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    expect(trigger).toHaveAttribute("aria-haspopup", "menu");
  });

  it("has data-state attribute indicating closed state", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    expect(trigger).toHaveAttribute("data-state", "closed");
  });

  it("renders the username initial in the trigger avatar", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    expect(trigger.textContent).toContain("T");
  });
});
