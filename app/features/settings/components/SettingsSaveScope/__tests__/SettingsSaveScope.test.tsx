import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const nav = vi.hoisted(() => {
  const push = vi.fn();
  return { pathname: "/settings/account", push, router: { push } };
});

vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => nav.router,
}));

import { SaveBar } from "../../SaveBar";
import { SettingsCard } from "../../SettingsCard";
import { PageSaveBar, SettingsSaveScope, useSettingsNavigate } from "..";

interface CardSpec {
  title: string;
  dirty: boolean;
  saveDisabled?: boolean;
  onSave: () => unknown;
  onCancel: () => void;
}

function NavigateButton({ href }: { href: string }) {
  const navigate = useSettingsNavigate();
  return (
    <button type="button" onClick={() => navigate(href)}>
      {`go ${href}`}
    </button>
  );
}

function Cards({ cards }: { cards: readonly CardSpec[] }) {
  return (
    <>
      {cards.map((card) => (
        <SettingsCard key={card.title} title={card.title}>
          <SaveBar
            isDirty={card.dirty}
            isSaving={false}
            saveDisabled={card.saveDisabled}
            onSave={card.onSave}
            onCancel={card.onCancel}
          />
        </SettingsCard>
      ))}
    </>
  );
}

function Harness({ cards, withPageBar = true }: { cards: readonly CardSpec[]; withPageBar?: boolean }) {
  return (
    <SettingsSaveScope>
      <Cards cards={cards} />
      {withPageBar ? <PageSaveBar /> : null}
      <a href="/settings/apps">apps link</a>
      <a href="/settings/account#password">same page link</a>
      <NavigateButton href="/settings/media" />
      <NavigateButton href="/settings/account#password" />
      <div data-anchor-target="password">password target</div>
    </SettingsSaveScope>
  );
}

function card(title: string, overrides: Partial<CardSpec> = {}): CardSpec {
  return { title, dirty: true, onSave: vi.fn(), onCancel: vi.fn(), ...overrides };
}

function unloadPrevented(): boolean {
  const event = new Event("beforeunload", { cancelable: true });
  window.dispatchEvent(event);
  return event.defaultPrevented;
}

const blockBrowserNavigation = (event: Event) => event.preventDefault();

const saveBar = enSettings.shell.saveBar;
const leave = enSettings.shell.leaveDialog;

beforeEach(() => {
  nav.pathname = "/settings/account";
  nav.push.mockReset();
  window.addEventListener("click", blockBrowserNavigation);
  Object.defineProperty(Element.prototype, "scrollIntoView", { value: vi.fn(), configurable: true });
});

afterEach(() => {
  window.removeEventListener("click", blockBrowserNavigation);
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("SettingsSaveScope with SaveBar", () => {
  it("renders no per card save bar inside the scope, even when the card is dirty", () => {
    render(<Harness cards={[card("Theme")]} withPageBar={false} />);
    expect(screen.queryByRole("button", { name: saveBar.save })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: saveBar.cancel })).not.toBeInTheDocument();
  });

  it("renders no page save bar while nothing is dirty", () => {
    render(<Harness cards={[card("Theme", { dirty: false })]} />);
    expect(screen.queryByRole("region", { name: saveBar.region })).not.toBeInTheDocument();
  });

  it("summarises the dirty cards with their card titles", () => {
    render(<Harness cards={[card("Theme"), card("Language"), card("Clean", { dirty: false })]} />);
    const region = screen.getByRole("region", { name: saveBar.region });
    expect(region).toHaveTextContent(i18n.t("settings:shell.saveBar.summary", { count: 2 }));
    expect(within(region).getByText("Theme, Language")).toBeInTheDocument();
    expect(region).not.toHaveTextContent("Clean");
  });

  it("saves every dirty card in order and leaves clean ones alone", async () => {
    const calls: string[] = [];
    const clean = vi.fn();
    render(
      <Harness
        cards={[
          card("Theme", { onSave: () => calls.push("Theme") }),
          card("Clean", { dirty: false, onSave: clean }),
          card("Language", { onSave: () => calls.push("Language") }),
        ]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: saveBar.save }));
    await waitFor(() => expect(calls).toEqual(["Theme", "Language"]));
    expect(clean).not.toHaveBeenCalled();
  });

  it("cancels every dirty card", async () => {
    const theme = card("Theme");
    const clean = card("Clean", { dirty: false });
    render(<Harness cards={[theme, clean]} />);
    await userEvent.click(screen.getByRole("button", { name: saveBar.cancel }));
    expect(theme.onCancel).toHaveBeenCalledOnce();
    expect(clean.onCancel).not.toHaveBeenCalled();
  });

  it("disables saving while any dirty card cannot be saved", () => {
    render(<Harness cards={[card("Theme"), card("Language", { saveDisabled: true })]} />);
    expect(screen.getByRole("button", { name: saveBar.save })).toBeDisabled();
    expect(screen.getByRole("button", { name: saveBar.cancel })).toBeEnabled();
  });
});

describe("SettingsSaveScope leaving the page", () => {
  it("lets a link through when nothing is dirty", async () => {
    render(<Harness cards={[card("Theme", { dirty: false })]} />);
    await userEvent.click(screen.getByText("apps link"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("blocks a link to another page while dirty and asks first", async () => {
    render(<Harness cards={[card("Theme")]} />);
    await userEvent.click(screen.getByText("apps link"));
    expect(screen.getByRole("dialog", { name: leave.title })).toBeInTheDocument();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("does not ask for a link to the same page", async () => {
    render(<Harness cards={[card("Theme")]} />);
    await userEvent.click(screen.getByText("same page link"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps editing when the user stays", async () => {
    const theme = card("Theme");
    render(<Harness cards={[theme]} />);
    await userEvent.click(screen.getByText("apps link"));
    await userEvent.click(screen.getByRole("button", { name: leave.stay }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(theme.onCancel).not.toHaveBeenCalled();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("keeps editing when the dialog is dismissed with Escape", async () => {
    const theme = card("Theme");
    render(<Harness cards={[theme]} />);
    await userEvent.click(screen.getByText("apps link"));
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(theme.onCancel).not.toHaveBeenCalled();
    expect(nav.push).not.toHaveBeenCalled();
    expect(unloadPrevented()).toBe(true);
  });

  it("discards the changes and navigates", async () => {
    const theme = card("Theme");
    render(<Harness cards={[theme]} />);
    await userEvent.click(screen.getByText("apps link"));
    await userEvent.click(screen.getByRole("button", { name: leave.discard }));
    expect(theme.onCancel).toHaveBeenCalledOnce();
    expect(theme.onSave).not.toHaveBeenCalled();
    expect(nav.push).toHaveBeenCalledWith("/settings/apps");
  });

  it("saves and then navigates", async () => {
    const order: string[] = [];
    const theme = card("Theme", { onSave: () => order.push("save") });
    nav.push.mockImplementation(() => order.push("push"));
    render(<Harness cards={[theme]} />);
    await userEvent.click(screen.getByText("apps link"));
    await userEvent.click(screen.getByRole("button", { name: leave.save }));
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith("/settings/apps"));
    expect(order).toEqual(["save", "push"]);
  });

  it("stays on the page when a save fails", async () => {
    const theme = card("Theme", {
      onSave: () => Promise.reject(new Error("nope")),
    });
    render(<Harness cards={[theme]} />);
    await userEvent.click(screen.getByText("apps link"));
    await userEvent.click(screen.getByRole("button", { name: leave.save }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("guards a page unload only while something is dirty", () => {
    const { rerender } = render(<Harness cards={[card("Theme", { dirty: false })]} />);
    expect(unloadPrevented()).toBe(false);

    rerender(<Harness cards={[card("Theme")]} />);
    expect(unloadPrevented()).toBe(true);

    rerender(<Harness cards={[card("Theme", { dirty: false })]} />);
    expect(unloadPrevented()).toBe(false);
  });

  it("stops intercepting links once the card is clean again", async () => {
    const { rerender } = render(<Harness cards={[card("Theme")]} />);
    rerender(<Harness cards={[card("Theme", { dirty: false })]} />);
    await userEvent.click(screen.getByText("apps link"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("drops a card from the summary when it unmounts", () => {
    const { rerender } = render(<Harness cards={[card("Theme"), card("Language")]} />);
    rerender(<Harness cards={[card("Language")]} />);
    const region = screen.getByRole("region", { name: saveBar.region });
    expect(region).toHaveTextContent(i18n.t("settings:shell.saveBar.summary", { count: 1 }));
    expect(within(region).getByText("Language")).toBeInTheDocument();
  });
});

describe("useSettingsNavigate", () => {
  it("routes through the scope and asks before leaving a dirty page", async () => {
    render(<Harness cards={[card("Theme")]} />);
    await userEvent.click(screen.getByRole("button", { name: "go /settings/media" }));
    expect(screen.getByRole("dialog", { name: leave.title })).toBeInTheDocument();
    expect(nav.push).not.toHaveBeenCalled();
  });

  it("navigates straight away when nothing is dirty", async () => {
    render(<Harness cards={[card("Theme", { dirty: false })]} />);
    await userEvent.click(screen.getByRole("button", { name: "go /settings/media" }));
    expect(nav.push).toHaveBeenCalledWith("/settings/media");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("highlights the anchor when the target is on the same page, even while dirty", async () => {
    render(<Harness cards={[card("Theme")]} />);
    await userEvent.click(screen.getByRole("button", { name: "go /settings/account#password" }));
    expect(nav.push).toHaveBeenCalledWith("/settings/account#password");
    expect(screen.getByText("password target")).toHaveAttribute("data-glow", "true");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("does not highlight anything when navigating to another page", async () => {
    render(<Harness cards={[card("Theme", { dirty: false })]} />);
    await userEvent.click(screen.getByRole("button", { name: "go /settings/media" }));
    expect(screen.getByText("password target")).not.toHaveAttribute("data-glow");
  });

  it("falls back to the router outside a scope", async () => {
    render(<NavigateButton href="/settings/apps" />);
    await userEvent.click(screen.getByRole("button", { name: "go /settings/apps" }));
    expect(nav.push).toHaveBeenCalledWith("/settings/apps");
  });
});
