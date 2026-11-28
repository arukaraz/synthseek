const SOURCE_FILES = ["app/**/*.tsx"];
const TEST_FILES = ["app/**/__tests__/**", "app/**/*.test.tsx"];

export const ARIA_RULES = [
  "alt-text",
  "anchor-has-content",
  "anchor-is-valid",
  "aria-activedescendant-has-tabindex",
  "aria-props",
  "aria-proptypes",
  "aria-role",
  "aria-unsupported-elements",
  "autocomplete-valid",
  "heading-has-content",
  "html-has-lang",
  "iframe-has-title",
  "img-redundant-alt",
  "media-has-caption",
  "no-access-key",
  "no-aria-hidden-on-focusable",
  "no-autofocus",
  "no-distracting-elements",
  "no-redundant-roles",
  "role-has-required-aria-props",
  "role-supports-aria-props",
  "scope",
  "tabindex-no-positive",
].map((name) => `jsx-a11y/${name}`);

const CONTROL_COMPONENTS = [
  "Input",
  "PasswordField",
  "Checkbox",
  "Switch",
  "RangeSlider",
  "SelectMenu",
  "SearchSelect",
  "SettingsTextInput",
  "SettingsNumberInput",
  "SettingsSecretInput",
];

export const LABEL_RULES = {
  "jsx-a11y/label-has-associated-control": [
    "error",
    { controlComponents: CONTROL_COMPONENTS, labelComponents: [], assert: "either", depth: 3 },
  ],
  "jsx-a11y/control-has-associated-label": [
    "error",
    {
      depth: 6,
      ignoreElements: ["audio", "canvas", "embed", "input", "textarea", "tr", "video"],
      ignoreRoles: [
        "grid",
        "listbox",
        "menu",
        "menubar",
        "radiogroup",
        "row",
        "tablist",
        "toolbar",
        "tree",
        "treegrid",
      ],
      includeRoles: ["alert", "dialog"],
    },
  ],
};

export const INTERACTION_ERROR_RULES = {
  "jsx-a11y/interactive-supports-focus": [
    "error",
    {
      tabbable: ["button", "checkbox", "link", "progressbar", "searchbox", "slider", "spinbutton", "switch", "textbox"],
    },
  ],
  "jsx-a11y/mouse-events-have-key-events": "error",
  "jsx-a11y/no-interactive-element-to-noninteractive-role": "error",
};

export const INTERACTION_RATCHETED_RULES = {
  "jsx-a11y/click-events-have-key-events": ["warn"],
  "jsx-a11y/no-noninteractive-element-interactions": [
    "warn",
    { body: ["onError", "onLoad"], iframe: ["onError", "onLoad"], img: ["onError", "onLoad"] },
  ],
  "jsx-a11y/no-noninteractive-element-to-interactive-role": ["warn"],
  "jsx-a11y/no-noninteractive-tabindex": [
    "warn",
    { tags: [], roles: ["tabpanel", "region", "group"], allowExpressionValues: true },
  ],
  "jsx-a11y/no-static-element-interactions": ["warn"],
};

export const EXEMPTIONS = [
  {
    rule: "jsx-a11y/anchor-has-content",
    files: ["app/features/settings/sections/IntegrationsSection/SpotifyRequirementsNotice.tsx"],
  },
  {
    rule: "jsx-a11y/control-has-associated-label",
    files: ["app/features/settings/sections/IntegrationsSection/SpotifyRequirementsNotice.tsx"],
  },
  {
    rule: "jsx-a11y/no-aria-hidden-on-focusable",
    files: ["app/components/Player/PlayerWave.tsx"],
  },
  {
    rule: "jsx-a11y/no-autofocus",
    files: [
      "app/components/RenamePlaylistDialog/RenamePlaylistDialogContent.tsx",
      "app/features/settings/components/SettingsSearch/SettingsPalette.tsx",
      "app/features/settings/sections/ThemeSection/components/CssMode/components/NewFileForm.tsx",
    ],
  },
];

export const RATCHETED_RULE_NAMES = Object.keys(INTERACTION_RATCHETED_RULES);

function asError(name) {
  return [name, "error"];
}

export const a11yConfigBlocks = [
  {
    files: SOURCE_FILES,
    ignores: TEST_FILES,
    rules: {
      ...Object.fromEntries(ARIA_RULES.map(asError)),
      ...LABEL_RULES,
      ...INTERACTION_ERROR_RULES,
      ...INTERACTION_RATCHETED_RULES,
    },
  },
  ...EXEMPTIONS.map(({ rule, files }) => ({ files, rules: { [rule]: "off" } })),
];
