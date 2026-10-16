import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import enSettings from "@modules/i18n/messages/en/settings.json";

const state = vi.hoisted(() => {
  const push = vi.fn();
  return { pathname: "/settings/account", isAdmin: true, isLoading: false, push, router: { push } };
});

vi.mock("next/navigation", () => ({
  usePathname: () => state.pathname,
  useRouter: () => state.router,
}));

vi.mock("@modules/providers/AuthProvider", () => ({
  useAuthContext: () => ({ isAdmin: state.isAdmin, isLoading: state.isLoading, currentUser: null }),
}));

vi.mock("@hooks/api/queries/useMaintenanceCounts", () => ({
  useMaintenanceCounts: () => ({ data: undefined }),
}));

vi.mock("@hooks/api/queries/useSystemStatus", () => ({
  useSystemStatus: () => ({ data: undefined }),
}));

vi.mock("@hooks/api/mutations/jobs/useTriggerJob", () => ({
  useTriggerJob: () => ({ mutate: vi.fn() }),
}));

import { SaveBar } from "../../SaveBar";
import { SEARCH_INPUT_ID } from "../../SettingsSearch";
import { SettingsShell } from "../SettingsShell";

const shell = enSettings.shell;

function renderShell(child = <p>page body</p>) {
  render(<SettingsShell>{child}</SettingsShell>);
  return {
    sidebar: screen.getByRole("navigation", { name: shell.sidebar.ariaLabel }),
    main: screen.getByRole("main"),
  };
}

beforeEach(() => {
  state.pathname = "/settings/account";
  state.isAdmin = true;
  state.isLoading = false;
  state.push.mockReset();
});

describe("SettingsShell layout", () => {
  it("shows only the sidebar on a phone at the settings root", () => {
    state.pathname = "/settings";
    const { sidebar, main } = renderShell();
    expect(sidebar).toHaveClass("flex");
    expect(sidebar).not.toHaveClass("hidden");
    expect(main).toHaveClass("hidden", "md:flex");
  });

  it("shows only the page on a phone below the root", () => {
    const { sidebar, main } = renderShell();
    expect(sidebar).toHaveClass("hidden", "md:flex");
    expect(main).toHaveClass("flex");
    expect(main).not.toHaveClass("hidden");
  });

  it("renders the page inside the main region", () => {
    const { main } = renderShell();
    expect(main).toHaveTextContent("page body");
  });

  it("hosts the page save bar for dirty cards on the page", () => {
    renderShell(<SaveBar isDirty isSaving={false} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("region", { name: shell.saveBar.region })).toBeInTheDocument();
  });
});

describe("SettingsShell access", () => {
  it("shows a member the access denied page on a server page", () => {
    state.isAdmin = false;
    state.pathname = "/settings/download-sources";
    renderShell();
    expect(screen.getByRole("heading", { name: shell.accessDenied.title })).toBeInTheDocument();
    expect(screen.queryByText("page body")).not.toBeInTheDocument();
  });

  it("shows an admin the server page", () => {
    state.pathname = "/settings/download-sources";
    renderShell();
    expect(screen.getByText("page body")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: shell.accessDenied.title })).not.toBeInTheDocument();
  });

  it("shows a member their own pages", () => {
    state.isAdmin = false;
    state.pathname = "/settings/listening";
    renderShell();
    expect(screen.getByText("page body")).toBeInTheDocument();
  });

  it("does not deny access while the session is still loading", () => {
    state.isAdmin = false;
    state.isLoading = true;
    state.pathname = "/settings/members";
    renderShell();
    expect(screen.getByText("page body")).toBeInTheDocument();
  });
});

describe("SettingsShell shortcuts", () => {
  it("opens the palette on Ctrl+K", async () => {
    renderShell();
    expect(screen.queryByRole("dialog", { name: shell.palette.title })).not.toBeInTheDocument();
    await userEvent.keyboard("{Control>}k{/Control}");
    expect(screen.getByRole("dialog", { name: shell.palette.title })).toBeInTheDocument();
  });

  it("focuses the sidebar search on /", async () => {
    renderShell();
    await userEvent.keyboard("/");
    const search = document.getElementById(SEARCH_INPUT_ID);
    expect(search).not.toBeNull();
    expect(search).toHaveFocus();
    expect(search).toHaveValue("");
  });

  it("leaves / to the field being typed in", async () => {
    renderShell(<input aria-label="other field" />);
    const other = screen.getByRole("textbox", { name: "other field" });
    await userEvent.click(other);
    await userEvent.keyboard("/");
    expect(other).toHaveFocus();
    expect(other).toHaveValue("/");
  });
});
