import { FlatCompat } from "@eslint/eslintrc";
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

const customPlugin = {
  rules: {
    "max-classname-classes": maxClassNameRule,
  },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript", "prettier"),

  {
    plugins: {
      custom: customPlugin,
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
    ignores: ["node_modules/**", ".next/**", "out/**", "e2e/**", "build/**", "next-env.d.ts"],
  },
];

export default eslintConfig;
