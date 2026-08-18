import { FlatCompat } from "@eslint/eslintrc";
import i18next from "eslint-plugin-i18next";
import htmlEntities from "eslint-plugin-i18next/lib/options/htmlEntities.js";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const maxClassNameRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Limit the number of Tailwind classes in a className attribute to 4 max",
      category: "Best Practices",
      recommended: true,
    },
    schema: [
      {
        type: "object",
        properties: {
          max: { type: "number", default: 4 },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const max = context.options[0]?.max ?? 4;

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className") return;

        if (!node.value || node.value.type !== "Literal") return;

        const value = node.value.value;
        if (typeof value !== "string") return;

        const classes = value.trim().split(/\s+/).filter(Boolean);

        if (classes.length > max) {
          context.report({
            node,
            message: `className has ${classes.length} classes (max: ${max}). Extract to styles.ts using CVA.`,
          });
        }
      },
    };
  },
};

const LEGACY_GRADIENT_ALIAS = "bg-gradient-to-";

const noLegacyGradientAliasRule = {
  meta: {
    type: "problem",
    docs: {
      description: "Ban the legacy bg-gradient-to-* alias, which tailwind-merge misclassifies as a background color",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },
  create(context) {
    const check = (node, value) => {
      if (typeof value !== "string" || !value.includes(LEGACY_GRADIENT_ALIAS)) return;

      context.report({
        node,
        message: `Use bg-linear-to-* instead of ${LEGACY_GRADIENT_ALIAS}*. Tailwind v4 renamed this utility and tailwind-merge v3 sorts the legacy alias into the background-color group, so cn() silently deletes the bg-* color it is merged with and the surface renders transparent.`,
      });
    };

    return {
      Literal(node) {
        check(node, node.value);
      },
      TemplateElement(node) {
        check(node, node.value.cooked);
      },
    };
  },
};

const customPlugin = {
  rules: {
    "max-classname-classes": maxClassNameRule,
    "no-legacy-gradient-alias": noLegacyGradientAliasRule,
  },
};

const brandNouns = [
  "Synthseek",
  "Plex",
  "Spotify",
  "Deezer",
  "Slskd",
  "Soulseek",
  "Beets",
  "Lidarr",
  "AcoustID",
  "MusicBrainz",
  "ListenBrainz",
  "FLAC",
  "MP3",
  "JSPF",
  "MCP",
  "OAuth",
  "Last\\.fm",
  "ynthseek",
];

const noLiteralStringOptions = {
  mode: "jsx-only",
  "jsx-attributes": {
    include: ["placeholder", "title", "aria-label", "alt"],
  },
  words: {
    exclude: ["[0-9!-/:-@[-`{-~]+", "[A-Z_-]+", htmlEntities, /^\p{Emoji}+$/u, ...brandNouns],
  },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  {
    plugins: {
      custom: customPlugin,
      i18next,
    },
  },
  {
    rules: {
      "custom/max-classname-classes": ["error", { max: 6 }],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "max-lines": [
        "warn",
        {
          max: 999,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
      "max-lines-per-function": [
        "warn",
        {
          max: 999,
          skipBlankLines: true,
          skipComments: true,
        },
      ],
    },
  },

  {
    files: ["app/**/*.ts", "app/**/*.tsx"],
    rules: {
      "custom/no-legacy-gradient-alias": "error",
    },
  },

  {
    files: ["**/__tests__/**/*", "**/*.test.ts", "**/*.test.tsx", "app/api/**/*.ts", "app/api/**/*.tsx"],
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "custom/max-classname-classes": "off",
    },
  },

  {
    files: ["cypress.config.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  {
    files: ["app/**/*.tsx"],
    ignores: ["app/modules/i18n/**", "app/**/*.test.tsx", "app/**/__tests__/**", "app/**/styles.ts"],
    rules: {
      "i18next/no-literal-string": ["error", noLiteralStringOptions],
    },
  },

  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "e2e/**",
      "build/**",
      "coverage/**",
      "sites/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
