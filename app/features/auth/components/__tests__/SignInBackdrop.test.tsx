import { fireEvent, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const query = vi.hoisted(() => ({ data: undefined as unknown }));

vi.mock("@hooks/api/queries/useSignInMethods", () => ({
  useSignInMethods: () => query,
}));

import { SignInBackdrop } from "../SignInBackdrop";

const URL = "/api/v1/sign-in-background?v=abc";

function respond(background: { url: string } | null) {
  query.data = { methods: [], setupRequired: false, background };
}

beforeEach(() => {
  query.data = undefined;
});

describe("SignInBackdrop", () => {
  it("draws nothing while the methods are loading", () => {
    const { container } = render(<SignInBackdrop />);

    expect(container).toBeEmptyDOMElement();
  });

  it("draws nothing when the server has no background", () => {
    respond(null);

    const { container } = render(<SignInBackdrop />);

    expect(container).toBeEmptyDOMElement();
  });

  it("draws the flattened image, hidden from assistive technology, with an empty alt", () => {
    respond({ url: URL });

    const { container } = render(<SignInBackdrop />);

    const image = container.querySelector("img");
    expect(image).toHaveAttribute("src", URL);
    expect(image).toHaveAttribute("alt", "");
    expect(image?.closest("[aria-hidden='true']")).not.toBeNull();
  });

  it("stays transparent until the image has loaded, so the scene beneath shows", () => {
    respond({ url: URL });
    const { container } = render(<SignInBackdrop />);
    const wrapper = container.firstElementChild as HTMLElement;
    const before = wrapper.className;

    fireEvent.load(container.querySelector("img") as HTMLImageElement);

    expect(wrapper.className).not.toBe(before);
  });

  it("removes itself when the image fails to load, leaving the scene beneath", () => {
    respond({ url: URL });
    const { container } = render(<SignInBackdrop />);

    fireEvent.error(container.querySelector("img") as HTMLImageElement);

    expect(container).toBeEmptyDOMElement();
  });

  it("tries again when the server gives a new version of the image after a failure", () => {
    respond({ url: URL });
    const { container, rerender } = render(<SignInBackdrop />);
    fireEvent.error(container.querySelector("img") as HTMLImageElement);
    expect(container).toBeEmptyDOMElement();

    respond({ url: "/api/v1/sign-in-background?v=def" });
    rerender(<SignInBackdrop />);

    expect(container.querySelector("img")).toHaveAttribute("src", "/api/v1/sign-in-background?v=def");
  });
});
