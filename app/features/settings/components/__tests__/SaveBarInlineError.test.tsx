import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

const nav = vi.hoisted(() => ({ router: { push: vi.fn() } }));

vi.mock("next/navigation", () => ({
  usePathname: () => "/settings/engine",
  useRouter: () => nav.router,
}));

import { SaveBar } from "../SaveBar";
import { PageSaveBar, SettingsSaveScope } from "../SettingsSaveScope";

await i18n.changeLanguage("en");

describe("a settings save that fails", () => {
  it("shows the failure next to the standalone Save button", async () => {
    const user = userEvent.setup();
    render(
      <SaveBar
        isDirty
        isSaving={false}
        onSave={() => Promise.reject(new Error("The server refused the change"))}
        onCancel={() => undefined}
      />
    );

    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(await screen.findByText("The server refused the change", { selector: "span" })).toBeInTheDocument();
  });

  it("takes the failure away when the change is cancelled", async () => {
    const user = userEvent.setup();
    render(
      <SaveBar
        isDirty
        isSaving={false}
        onSave={() => Promise.reject(new Error("The server refused the change"))}
        onCancel={() => undefined}
      />
    );
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));
    await screen.findByText("The server refused the change", { selector: "span" });

    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));

    expect(screen.queryByText("The server refused the change")).not.toBeInTheDocument();
  });

  it("shows the first failure of the page's save-all next to the page bar", async () => {
    const user = userEvent.setup();
    render(
      <SettingsSaveScope>
        <SaveBar
          isDirty
          isSaving={false}
          onSave={() => Promise.reject(new Error("Quota is full"))}
          onCancel={() => undefined}
        />
        <PageSaveBar />
      </SettingsSaveScope>
    );

    await waitFor(() => expect(screen.getByRole("button", { name: enSettings.shell.saveBar.save })).toBeEnabled());
    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(await screen.findByText("Quota is full", { selector: "span" })).toBeInTheDocument();
  });

  it("shows nothing extra when the save works", async () => {
    const user = userEvent.setup();
    render(<SaveBar isDirty isSaving={false} onSave={() => Promise.resolve()} onCancel={() => undefined} />);

    await user.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));

    expect(document.querySelector("[data-inline-error]")).toBeNull();
  });
});
