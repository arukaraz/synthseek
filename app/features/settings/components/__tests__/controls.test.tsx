import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Music } from "lucide-react";

import "@test/mocks/next.mock";

import { SaveBar } from "../SaveBar";
import { SegmentedControl } from "../SegmentedControl";
import { SettingsCard } from "../SettingsCard";
import { SettingsNumberInput } from "../SettingsNumberInput";
import { SettingsSecretInput } from "../SettingsSecretInput";
import { IntegrationTabs } from "../IntegrationTabs";

import enSettings from "@modules/i18n/messages/en/settings.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("SettingsNumberInput", () => {
  it("renders the current value and a suffix", () => {
    render(<SettingsNumberInput value={42} onChange={vi.fn()} suffix="ms" ariaLabel="count" />);
    expect(screen.getByLabelText("count")).toHaveValue(42);
    expect(screen.getByText("ms")).toBeInTheDocument();
  });

  it("renders an empty input for a non-finite value", () => {
    render(<SettingsNumberInput value={Number.NaN} onChange={vi.fn()} ariaLabel="count" />);
    expect(screen.getByLabelText("count")).toHaveValue(null);
  });

  it("propagates finite changes", () => {
    const onChange = vi.fn();
    render(<SettingsNumberInput value={1} onChange={onChange} ariaLabel="count" />);
    fireEvent.change(screen.getByLabelText("count"), { target: { value: "5" } });
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("clamps to max on blur", () => {
    const onChange = vi.fn();
    render(<SettingsNumberInput value={5} onChange={onChange} min={0} max={10} ariaLabel="count" />);
    const input = screen.getByLabelText("count");
    fireEvent.change(input, { target: { value: "99" } });
    fireEvent.blur(input, { target: { value: "99" } });
    expect(onChange).toHaveBeenLastCalledWith(10);
  });

  it("falls back to min on blur when the value is not a number", () => {
    const onChange = vi.fn();
    render(<SettingsNumberInput value={5} onChange={onChange} min={3} ariaLabel="count" />);
    fireEvent.blur(screen.getByLabelText("count"), { target: { value: "" } });
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("clamps to min on blur when below the floor", () => {
    const onChange = vi.fn();
    render(<SettingsNumberInput value={5} onChange={onChange} min={2} max={10} ariaLabel="count" />);
    fireEvent.blur(screen.getByLabelText("count"), { target: { value: "-4" } });
    expect(onChange).toHaveBeenLastCalledWith(2);
  });
});

describe("SettingsSecretInput", () => {
  it("masks the value and toggles visibility", async () => {
    render(<SettingsSecretInput value="secret" onChange={vi.fn()} ariaLabel="token" />);
    const input = screen.getByLabelText("token");
    expect(input).toHaveAttribute("type", "password");

    await userEvent.click(screen.getByLabelText(enSettings.shell.secretInput.reveal));
    expect(input).toHaveAttribute("type", "text");

    await userEvent.click(screen.getByLabelText(enSettings.shell.secretInput.hide));
    expect(input).toHaveAttribute("type", "password");
  });

  it("propagates changes", () => {
    const onChange = vi.fn();
    render(<SettingsSecretInput value="" onChange={onChange} ariaLabel="token" />);
    fireEvent.change(screen.getByLabelText("token"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledWith("abc");
  });
});

describe("SegmentedControl", () => {
  it("renders options and reports the active one", () => {
    render(
      <SegmentedControl
        value="a"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
        onChange={vi.fn()}
        ariaLabel="choice"
      />
    );
    expect(screen.getByRole("radio", { name: "Alpha" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Beta" })).toHaveAttribute("aria-checked", "false");
  });

  it("invokes onChange when selecting an option", async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        value="a"
        options={[
          { value: "a", label: "Alpha" },
          { value: "b", label: "Beta" },
        ]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: "Beta" }));
    expect(onChange).toHaveBeenCalledWith("b");
  });
});

describe("SaveBar", () => {
  it("renders nothing when not dirty and not saving", () => {
    const { container } = render(<SaveBar isDirty={false} isSaving={false} onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("invokes save and cancel handlers when dirty", async () => {
    const onSave = vi.fn();
    const onCancel = vi.fn();
    render(<SaveBar isDirty isSaving={false} onSave={onSave} onCancel={onCancel} />);

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.save }));
    expect(onSave).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: enSettings.shell.saveBar.cancel }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("shows the saving label and disables actions while saving", () => {
    render(<SaveBar isDirty isSaving onSave={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: enSettings.shell.saveBar.saving })).toBeDisabled();
  });
});

describe("SettingsCard", () => {
  it("renders the title, inline description, and children", () => {
    render(
      <SettingsCard title="My card" description="Short description">
        <span>body</span>
      </SettingsCard>
    );
    expect(screen.getByRole("heading", { name: /My card/ })).toBeInTheDocument();
    expect(screen.getByText("Short description")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("renders the optional marker and trailing content", () => {
    render(
      <SettingsCard title="Optional card" optional trailing={<button type="button">Action</button>}>
        <span>body</span>
      </SettingsCard>
    );
    expect(screen.getByText(enSettings.shell.card.optional)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Action" })).toBeInTheDocument();
  });

  it("collapses a long description into a tooltip trigger", () => {
    const longDescription = "x".repeat(80);
    render(
      <SettingsCard title="Long card" description={longDescription}>
        <span>body</span>
      </SettingsCard>
    );
    expect(screen.queryByText(longDescription)).not.toBeInTheDocument();
  });
});

describe("IntegrationTabs", () => {
  it("renders tabs and marks the active one based on the pathname", () => {
    render(
      <IntegrationTabs
        items={[
          { href: "/", label: "Home", icon: Music },
          { href: "/other", label: "Other", icon: Music },
        ]}
      />
    );

    const homeLink = screen.getByRole("link", { name: /Home/ });
    expect(homeLink).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /Other/ })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("navigation", { name: enSettings.shell.integrationTabs.ariaLabel })).toBeInTheDocument();
  });
});
