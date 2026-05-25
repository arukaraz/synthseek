import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatarMenu } from "../UserAvatarMenu";

const mockSetTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    setTheme: mockSetTheme,
  }),
}));

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

  it("renders user icon inside avatar", () => {
    render(<UserAvatarMenu />);

    const trigger = screen.getByLabelText("User menu");
    const svg = trigger.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("lucide-user");
  });
});
