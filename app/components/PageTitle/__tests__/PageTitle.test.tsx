import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import i18n from "@locale";
import { resetAnnouncements } from "@utils/announcer";
import { publishNowPlayingTitle } from "@utils/nowPlayingTitle";

import { PageTitle } from "../PageTitle";

const route = vi.hoisted(() => ({ pathname: "/library" }));

vi.mock("next/navigation", () => ({
  usePathname: () => route.pathname,
}));

function open(pathname: string, view: ReturnType<typeof render>) {
  route.pathname = pathname;
  view.rerender(<PageTitle />);
}

beforeEach(async () => {
  route.pathname = "/library";
  document.querySelectorAll("title").forEach((element) => element.remove());
  await act(() => i18n.changeLanguage("en"));
});

afterEach(async () => {
  act(() => resetAnnouncements());
  act(() => publishNowPlayingTitle(null));
  await act(() => i18n.changeLanguage("en"));
});

describe("PageTitle title", () => {
  it("names the tab after the page and the app", () => {
    render(<PageTitle />);

    expect(document.title).toBe("Library | Synthseek");
  });

  it("names a settings tab after its page", () => {
    route.pathname = "/settings/customization/theme";
    render(<PageTitle />);

    expect(document.title).toBe("Theme · Customization | Synthseek");
  });

  it("falls back to the app name on a route it does not know", () => {
    route.pathname = "/somewhere-else";
    render(<PageTitle />);

    expect(document.title).toBe("Synthseek");
  });

  it("follows the pages as the visitor moves", () => {
    const view = render(<PageTitle />);

    open("/requests", view);

    expect(document.title).toBe("Requests | Synthseek");
  });

  it("follows a language switch without a reload", async () => {
    render(<PageTitle />);

    await act(() => i18n.changeLanguage("es"));

    expect(document.title).toBe("Biblioteca | Synthseek");
  });

  it("owns exactly one title element, in the head", () => {
    render(<PageTitle />);

    const titles = document.querySelectorAll("title");

    expect(titles).toHaveLength(1);
    expect(titles[0]?.parentElement).toBe(document.head);
  });

  it("leaves no title behind once unmounted, because React owns the element", () => {
    const view = render(<PageTitle />);

    view.unmount();

    expect(document.querySelectorAll("title")).toHaveLength(0);
  });

  it("keeps a single title element as the page and the language change", async () => {
    const view = render(<PageTitle />);

    open("/requests", view);
    await act(() => i18n.changeLanguage("es"));

    expect(document.querySelectorAll("title")).toHaveLength(1);
    expect(document.title).toBe("Solicitudes | Synthseek");
  });
});

describe("PageTitle and the player", () => {
  it("lets the tab show what is playing", () => {
    render(<PageTitle />);

    act(() => publishNowPlayingTitle("Digital Love - Daft Punk"));

    expect(document.title).toBe("Digital Love - Daft Punk");
  });

  it("gives the tab back to the page it is on once playback stops", () => {
    const view = render(<PageTitle />);
    act(() => publishNowPlayingTitle("Digital Love - Daft Punk"));
    open("/requests", view);

    act(() => publishNowPlayingTitle(null));

    expect(document.title).toBe("Requests | Synthseek");
  });
});

describe("PageTitle announcement", () => {
  it("says nothing on first load", () => {
    act(() => publishNowPlayingTitle("Digital Love - Daft Punk"));
    render(<PageTitle />);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("names the new page politely while the tab shows what is playing", () => {
    const view = render(<PageTitle />);
    act(() => publishNowPlayingTitle("Digital Love - Daft Punk"));

    open("/requests", view);

    expect(screen.getByRole("status")).toHaveTextContent("Requests");
    expect(screen.getByRole("status")).toHaveAttribute("aria-live", "polite");
  });

  it("leaves the announcement to the Next.js route announcer when the tab names the page", () => {
    const view = render(<PageTitle />);

    open("/requests", view);

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("does not announce again when only the language changes", async () => {
    const view = render(<PageTitle />);
    act(() => publishNowPlayingTitle("Digital Love - Daft Punk"));
    open("/requests", view);

    await act(() => i18n.changeLanguage("es"));

    expect(screen.getByRole("status")).toHaveTextContent("Requests");
  });
});
