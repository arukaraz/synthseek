import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import AuthLayout from "../layout";

vi.mock("@components/AuthScene", () => ({
  AuthScene: () => null,
}));

describe("AuthLayout", () => {
  it("holds the sign in and set up pages inside the main landmark", () => {
    render(
      <AuthLayout>
        <p>sign in form</p>
      </AuthLayout>
    );

    expect(screen.getByRole("main")).toHaveTextContent("sign in form");
  });
});
