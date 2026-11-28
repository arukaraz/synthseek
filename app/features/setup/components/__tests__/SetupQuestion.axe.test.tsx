import { Mail } from "lucide-react";
import { describe, it, vi } from "vitest";

import { expectNoAxeViolations } from "@test/a11y/axe";
import { render } from "@test/test-utils";

import { ChoiceTiles } from "../ChoiceTiles";
import { QuestionFrame } from "../QuestionFrame";
import { TextField } from "../TextField";

vi.mock("@components/AccessibilityPanel", () => ({
  AccessibilityPanel: () => <button type="button">Accessibility</button>,
}));

const noop = (): void => undefined;

describe("a first-run setup question", () => {
  it("has no axe violation with a choice of tiles", async () => {
    render(
      <QuestionFrame step="media" focusKey="media" title="Where is your music?" description="Pick one.">
        <ChoiceTiles
          label="Library source"
          choices={[
            { key: "plex", title: "Plex", caption: "Use a Plex server" },
            { key: "folder", title: "A folder", caption: "Read files from disk" },
          ]}
          selected="plex"
          onChoose={noop}
        />
      </QuestionFrame>
    );

    await expectNoAxeViolations();
  });

  it("has no axe violation with a text field and its error", async () => {
    render(
      <QuestionFrame step="metadata" focusKey="metadata" title="What is your email?">
        <TextField
          label="Email"
          value="ada"
          onChange={noop}
          icon={Mail}
          type="email"
          autoComplete="email"
          error="Enter a valid email address."
        />
      </QuestionFrame>
    );

    await expectNoAxeViolations();
  });
});
