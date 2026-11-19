import { describe, expect, it, vi } from "vitest";

import { renderWithProviders, screen, waitFor } from "@test/test-utils";
import enContentDetail from "@modules/i18n/messages/en/contentDetail.json";

import { HeroPlaySplit } from "../HeroPlaySplit";

const PLAY = enContentDetail.playAll.replace("{{name}}", "Road Trip");
const MORE = enContentDetail.moreListening.replace("{{name}}", "Road Trip");

const idle = () => vi.fn(async () => undefined);

describe("HeroPlaySplit", () => {
  it("plays with one click on the main half", async () => {
    const onPlay = idle();
    const { user } = renderWithProviders(<HeroPlaySplit mode="playlist" name="Road Trip" onPlay={onPlay} />);

    await user.click(screen.getByRole("button", { name: PLAY }));

    expect(onPlay).toHaveBeenCalledTimes(1);
  });

  it("offers no menu when playing is the only way to listen", () => {
    renderWithProviders(<HeroPlaySplit mode="playlist" name="Road Trip" onPlay={idle()} />);

    expect(screen.queryByRole("button", { name: MORE })).not.toBeInTheDocument();
  });

  it("keeps shuffle, radio and the queue behind the arrow, each running its own action", async () => {
    const onPlay = idle();
    const onShuffle = idle();
    const onStartRadio = idle();
    const onEnqueue = idle();
    const { user } = renderWithProviders(
      <HeroPlaySplit
        mode="artist"
        name="Road Trip"
        onPlay={onPlay}
        onShuffle={onShuffle}
        onStartRadio={onStartRadio}
        onEnqueue={onEnqueue}
      />
    );

    await user.click(screen.getByRole("button", { name: MORE }));
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      enContentDetail.shuffle,
      `${enContentDetail.startRadio}${enContentDetail.startRadioInfo}`,
      enContentDetail.addToQueue,
    ]);
    await user.click(screen.getByRole("menuitem", { name: enContentDetail.shuffle }));
    expect(onShuffle).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: new RegExp(`^${enContentDetail.startRadio}`) }));
    expect(onStartRadio).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: MORE }));
    await user.click(screen.getByRole("menuitem", { name: enContentDetail.addToQueue }));
    expect(onEnqueue).toHaveBeenCalledTimes(1);
    expect(onPlay).not.toHaveBeenCalled();
  });

  it("lists only the ways the window was given", async () => {
    const { user } = renderWithProviders(
      <HeroPlaySplit mode="playlist" name="Road Trip" onPlay={idle()} onShuffle={idle()} />
    );

    await user.click(screen.getByRole("button", { name: MORE }));

    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([enContentDetail.shuffle]);
  });

  it("takes one click while playback is still starting", async () => {
    let finish: () => void = () => undefined;
    const onPlay = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve;
        })
    );
    const { user } = renderWithProviders(
      <HeroPlaySplit mode="album" name="Road Trip" onPlay={onPlay} onShuffle={idle()} />
    );
    const button = screen.getByRole("button", { name: PLAY });

    await user.click(button);
    await waitFor(() => expect(button).toBeDisabled());
    expect(screen.getByRole("button", { name: MORE })).toBeDisabled();
    await user.click(button);
    finish();

    expect(onPlay).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(button).toBeEnabled());
  });
});
