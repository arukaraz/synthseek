import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";

import { HeroShuffleButton } from "../HeroShuffleButton";

const LABEL = enContentDetail.shuffleAll.replace("{{name}}", "Road Trip");

describe("HeroShuffleButton", () => {
  it("shuffles under the name on screen, from a button that shows only its icon", async () => {
    const onShuffle = vi.fn(async () => undefined);
    const { user } = renderWithProviders(<HeroShuffleButton name="Road Trip" onShuffle={onShuffle} />);
    const button = screen.getByRole("button", { name: LABEL });

    await user.click(button);

    expect(onShuffle).toHaveBeenCalledTimes(1);
    expect(button).toHaveTextContent("");
  });

  it("takes one click while the shuffle is still starting", async () => {
    let finish: () => void = () => undefined;
    const onShuffle = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { user } = renderWithProviders(<HeroShuffleButton name="Road Trip" onShuffle={onShuffle} />);
    const button = screen.getByRole("button", { name: LABEL });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);
    finish();

    expect(onShuffle).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toBeEnabled());
  });

  it("names what it does when the listener hovers it", async () => {
    const { user } = renderWithProviders(<HeroShuffleButton name="Road Trip" onShuffle={vi.fn()} />);

    await user.hover(screen.getByRole("button", { name: LABEL }));

    expect(await screen.findByRole("tooltip")).toHaveTextContent(LABEL);
  });
});
