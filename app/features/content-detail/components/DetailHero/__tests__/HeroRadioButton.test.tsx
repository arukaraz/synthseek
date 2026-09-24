import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";

import { HeroRadioButton } from "../HeroRadioButton";

const LABEL = enContentDetail.startRadioFrom.replace("{{name}}", "Daft Punk");

describe("HeroRadioButton", () => {
  it("starts the radio under the name on screen", async () => {
    const onStartRadio = vi.fn(async () => undefined);
    const { user } = renderWithProviders(<HeroRadioButton name="Daft Punk" onStartRadio={onStartRadio} />);

    await user.click(screen.getByRole("button", { name: LABEL }));

    expect(onStartRadio).toHaveBeenCalledTimes(1);
  });

  it("takes one click while the station is still loading, and comes back once it has", async () => {
    let finish: () => void = () => undefined;
    const onStartRadio = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { user } = renderWithProviders(<HeroRadioButton name="Daft Punk" onStartRadio={onStartRadio} />);
    const button = screen.getByRole("button", { name: LABEL });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    await user.click(button);

    expect(onStartRadio).toHaveBeenCalledTimes(1);

    finish();

    await waitFor(() => expect(button).toBeEnabled());
  });
});
