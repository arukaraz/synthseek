import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import enComponents from "@modules/i18n/messages/en/components.json";

import { confirm } from "../confirm";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("confirm", () => {
  it("puts the question on screen without the caller rendering anything", async () => {
    void confirm({ title: "Delete this playlist?", message: "Its tracks stay in the library." });

    expect(await screen.findByText("Delete this playlist?")).toBeInTheDocument();
    expect(screen.getByText("Its tracks stay in the library.")).toBeInTheDocument();
  });

  it("answers yes when the listener confirms", async () => {
    const user = userEvent.setup();
    const answer = confirm({ title: "Delete this playlist?", message: "This cannot be undone." });

    await user.click(await screen.findByRole("button", { name: enComponents.confirmation.confirm }));

    await expect(answer).resolves.toBe(true);
  });

  it("answers no when the listener backs out", async () => {
    const user = userEvent.setup();
    const answer = confirm({ title: "Delete this playlist?", message: "This cannot be undone." });

    await user.click(await screen.findByRole("button", { name: enComponents.confirmation.cancel }));

    await expect(answer).resolves.toBe(false);
  });

  it("uses the wording the caller chose for the two answers", async () => {
    void confirm({
      title: "Move these files?",
      message: "They will be renamed.",
      confirmText: "Move them",
      cancelText: "Leave them",
    });

    expect(await screen.findByRole("button", { name: "Move them" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Leave them" })).toBeInTheDocument();
  });

  it("takes itself back off the page once it has been answered", async () => {
    const user = userEvent.setup();
    const answer = confirm({ title: "Delete this playlist?", message: "This cannot be undone." });
    await user.click(await screen.findByRole("button", { name: enComponents.confirmation.confirm }));
    await answer;

    await waitFor(() => expect(screen.queryByText("Delete this playlist?")).not.toBeInTheDocument());
  });

  it("asks one question at a time without the earlier one bleeding through", async () => {
    const user = userEvent.setup();
    const first = confirm({ title: "First question", message: "one" });
    await user.click(await screen.findByRole("button", { name: enComponents.confirmation.confirm }));
    await first;

    void confirm({ title: "Second question", message: "two" });

    expect(await screen.findByText("Second question")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText("First question")).not.toBeInTheDocument());
  });
});
