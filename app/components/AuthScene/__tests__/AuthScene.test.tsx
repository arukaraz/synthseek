import { describe, it, expect } from "vitest";

import { render } from "@test/test-utils";

import { AuthScene } from "../AuthScene";
import { authGrid, authOrb, authSceneRoot } from "../styles";

describe("AuthScene", () => {
  it("renders a decorative, non-interactive backdrop", () => {
    const { container } = render(<AuthScene />);

    const root = container.firstElementChild;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
  });

  it("renders the grid and orb layers", () => {
    const { container } = render(<AuthScene />);

    expect(container.querySelector(".auth-grid")).not.toBeNull();
    expect(container.querySelector(".auth-orb")).not.toBeNull();
  });
});

describe("AuthScene styles", () => {
  it("fixes the scene root to the viewport behind content", () => {
    expect(authSceneRoot()).toContain("fixed");
    expect(authSceneRoot()).toContain("inset-0");
    expect(authSceneRoot()).toContain("z-0");
  });

  it("stretches the grid across the scene", () => {
    expect(authGrid()).toContain("inset-0");
    expect(authGrid()).toContain("auth-grid");
  });

  it("renders the orb as a centered rounded blob", () => {
    expect(authOrb()).toContain("rounded-full");
    expect(authOrb()).toContain("auth-orb");
  });
});
