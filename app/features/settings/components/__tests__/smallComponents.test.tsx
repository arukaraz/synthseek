import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import i18n from "@modules/i18n";
import enSettings from "@modules/i18n/messages/en/settings.json";

import { ResetDefaultsButton } from "../ResetDefaultsButton";
import { SettingsAccessDenied } from "../SettingsAccessDenied";
import { SettingsPagePlaceholder } from "../SettingsPagePlaceholder";
import { EngineRow } from "../EngineRow";
import { Pill } from "../Pill";

beforeAll(() => {
  i18n.addResourceBundle("en", "settings", enSettings, true, true);
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ResetDefaultsButton", () => {
  it("invokes onReset when pressed", async () => {
    const onReset = vi.fn();
    render(<ResetDefaultsButton onReset={onReset} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(onReset).toHaveBeenCalledOnce();
  });

  it("does not fire while disabled", async () => {
    const onReset = vi.fn();
    render(<ResetDefaultsButton onReset={onReset} disabled />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.resetDefaults.label }));

    expect(onReset).not.toHaveBeenCalled();
  });
});

describe("SettingsAccessDenied", () => {
  it("renders the restricted title and message", () => {
    render(<SettingsAccessDenied />);

    expect(screen.getByText(enSettings.shell.accessDenied.title)).toBeInTheDocument();
    expect(screen.getByText(enSettings.shell.accessDenied.message)).toBeInTheDocument();
  });
});

describe("SettingsPagePlaceholder", () => {
  it("renders the title and the default coming-soon message", () => {
    render(<SettingsPagePlaceholder title="Beta" />);

    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByText(enSettings.shell.placeholder.comingSoon)).toBeInTheDocument();
  });

  it("renders a custom message when supplied", () => {
    render(<SettingsPagePlaceholder title="Beta" message="Not yet" />);

    expect(screen.getByText("Not yet")).toBeInTheDocument();
    expect(screen.queryByText(enSettings.shell.placeholder.comingSoon)).not.toBeInTheDocument();
  });
});

describe("EngineRow", () => {
  it("renders the label, description, trailing node, control, and anchor", () => {
    render(
      <EngineRow
        label="Concurrency"
        labelTrailing={<span>beta</span>}
        description="How many downloads run at once"
        control={<button type="button">edit</button>}
        anchor="concurrency"
      />
    );

    expect(screen.getByText("Concurrency")).toBeInTheDocument();
    expect(screen.getByText("beta")).toBeInTheDocument();
    expect(screen.getByText("How many downloads run at once")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "edit" })).toBeInTheDocument();
    expect(document.querySelector('[data-anchor-target="concurrency"]')).not.toBeNull();
  });
});

describe("Pill", () => {
  it("renders its children", () => {
    render(<Pill tone="accent">Active</Pill>);

    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
