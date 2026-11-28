import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { expectNoAxeViolations } from "@test/a11y/axe";

import { ConnectionValueField } from "../../sections/GeneralSection/ConnectionValueField";
import { TYPED_SECRET } from "../constants";
import { SettingsField } from "../SettingsField";
import { SettingsSecretInput } from "../SettingsSecretInput";
import { SettingsTextInput } from "../SettingsTextInput";

describe("settings field labels", () => {
  it("names a read-only value by the label of its field", () => {
    render(
      <SettingsField label="Subsonic URL">
        <SettingsTextInput value="https://synthseek.example/rest" readOnly />
      </SettingsField>
    );

    expect(screen.getByRole("textbox", { name: "Subsonic URL" })).toHaveValue("https://synthseek.example/rest");
  });

  it("names a read-only value that has a copy button", () => {
    render(
      <ConnectionValueField
        label="MCP URL"
        value="https://synthseek.example/api/v1/mcp"
        copyAriaLabel="Copy the MCP URL"
        copiedMessage="Copied"
        copyFailedMessage="Not copied"
      />
    );

    expect(screen.getByRole("textbox", { name: "MCP URL" })).toHaveValue("https://synthseek.example/api/v1/mcp");
    expect(screen.getByRole("button", { name: "Copy the MCP URL" })).toBeInTheDocument();
  });

  it("names a password field by the label of its field", () => {
    render(
      <SettingsField label="API key">
        <SettingsSecretInput value="" onChange={vi.fn()} source={TYPED_SECRET} />
      </SettingsField>
    );

    expect(screen.getByLabelText("API key")).toHaveAttribute("type", "password");
  });

  it("names a field whose label carries a trailing control", () => {
    render(
      <SettingsField label="Server URL" labelTrailing={<span>optional</span>}>
        <SettingsTextInput value="" onChange={vi.fn()} />
      </SettingsField>
    );

    expect(screen.getByRole("textbox", { name: "Server URL" })).toBeInTheDocument();
  });

  it("keeps the name a field was given on purpose", () => {
    render(
      <SettingsField label="Account">
        <SettingsTextInput value="" onChange={vi.fn()} ariaLabel="Username" />
      </SettingsField>
    );

    expect(screen.getByRole("textbox", { name: "Username" })).toBeInTheDocument();
  });

  it("leaves an input outside any field as it was", () => {
    render(<SettingsTextInput value="" onChange={vi.fn()} />);

    expect(screen.getByRole("textbox")).not.toHaveAttribute("aria-labelledby");
  });

  it("keeps a secret and an address out of the browser's autofill by default", () => {
    render(
      <>
        <SettingsSecretInput value="" onChange={vi.fn()} source={TYPED_SECRET} ariaLabel="Secret" />
        <SettingsTextInput type="url" value="" onChange={vi.fn()} ariaLabel="Address" />
        <SettingsTextInput value="" onChange={vi.fn()} ariaLabel="Plain" />
      </>
    );

    expect(screen.getByLabelText("Secret")).toHaveAttribute("autocomplete", "off");
    expect(screen.getByLabelText("Address")).toHaveAttribute("autocomplete", "off");
    expect(screen.getByLabelText("Plain")).not.toHaveAttribute("autocomplete");
  });

  it("leaves the label to its own element when the field points at an input", () => {
    render(
      <SettingsField label="Host" htmlFor="host">
        <SettingsTextInput id="host" value="" onChange={vi.fn()} />
      </SettingsField>
    );

    const input = screen.getByRole("textbox", { name: "Host" });
    expect(input).not.toHaveAttribute("aria-labelledby");
  });
});

describe("settings field axe", () => {
  it("has no violation for a text, a read-only, a copyable and a secret field", async () => {
    render(
      <div>
        <SettingsField label="Server URL" helper="Where the server lives.">
          <SettingsTextInput value="" onChange={vi.fn()} />
        </SettingsField>
        <SettingsField label="Subsonic URL">
          <SettingsTextInput value="https://synthseek.example/rest" readOnly />
        </SettingsField>
        <ConnectionValueField
          label="MCP URL"
          value="https://synthseek.example/api/v1/mcp"
          copyAriaLabel="Copy the MCP URL"
          copiedMessage="Copied"
          copyFailedMessage="Not copied"
        />
        <SettingsField label="API key">
          <SettingsSecretInput value="" onChange={vi.fn()} source={TYPED_SECRET} />
        </SettingsField>
      </div>
    );

    await expectNoAxeViolations();
  });
});
