import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

import {
  ARIA_RULES,
  EXEMPTIONS,
  INTERACTION_ERROR_RULES,
  INTERACTION_RATCHETED_RULES,
  LABEL_RULES,
  RATCHETED_RULE_NAMES,
} from "../../lint/a11y-groups.js";
import baseline from "../../lint/a11y-baseline.json";

import { addViolation, compareToBaseline, type RuleCounts } from "./ratchet";

const PLUGIN_PREFIX = "jsx-a11y/";
const SAMPLE_FILE = "app/components/ui/Button/Button.tsx";
const ERROR = 2;
const WARNING = 1;
const OFF = 0;
const LINT_TIMEOUT_MS = 240_000;

const eslint = new ESLint({ cwd: process.cwd() });

type Resolved = Record<string, unknown>;

async function resolvedRules(file: string): Promise<Resolved> {
  const config = await eslint.calculateConfigForFile(file);
  return config?.rules ?? {};
}

function levelOf(entry: unknown): number | string | undefined {
  const level = Array.isArray(entry) ? entry[0] : entry;
  if (typeof level === "number" || typeof level === "string") return level;
  return undefined;
}

function optionsOf(entry: unknown): unknown[] {
  return Array.isArray(entry) ? entry.slice(1) : [];
}

function ruleNameOf(key: string): string {
  return key.startsWith(PLUGIN_PREFIX) ? key.slice(PLUGIN_PREFIX.length) : key;
}

describe("the resolved ESLint configuration", () => {
  it("holds the static ARIA group as errors", async () => {
    const rules = await resolvedRules(SAMPLE_FILE);
    for (const rule of ARIA_RULES) expect(levelOf(rules[rule]), rule).toBe(ERROR);
  });

  it("holds the label group as errors with the project's wrapped controls", async () => {
    const rules = await resolvedRules(SAMPLE_FILE);
    for (const [rule, entry] of Object.entries(LABEL_RULES)) {
      expect(levelOf(rules[rule]), rule).toBe(ERROR);
      expect(optionsOf(rules[rule]), rule).toEqual(optionsOf(entry));
    }
    const controls = optionsOf(rules["jsx-a11y/label-has-associated-control"]);
    expect(controls[0]).toMatchObject({ controlComponents: expect.arrayContaining(["Input", "Checkbox"]) });
  });

  it("holds the interaction rules with no violation as errors", async () => {
    const rules = await resolvedRules(SAMPLE_FILE);
    for (const rule of Object.keys(INTERACTION_ERROR_RULES)) expect(levelOf(rules[rule]), rule).toBe(ERROR);
  });

  it("holds the ratcheted interaction rules as warnings", async () => {
    const rules = await resolvedRules(SAMPLE_FILE);
    for (const rule of Object.keys(INTERACTION_RATCHETED_RULES)) expect(levelOf(rules[rule]), rule).toBe(WARNING);
  });

  it("switches a rule off only for the files the exemptions name", async () => {
    for (const { rule, files } of EXEMPTIONS) {
      for (const file of files) expect(levelOf((await resolvedRules(file))[rule]), `${rule} in ${file}`).toBe(OFF);
      expect(levelOf((await resolvedRules(SAMPLE_FILE))[rule]), rule).not.toBe(OFF);
    }
  });

  it("does not hold test files to the group", async () => {
    const rules = await resolvedRules("app/components/ui/Button/__tests__/Button.test.tsx");
    expect(levelOf(rules["jsx-a11y/no-static-element-interactions"])).not.toBe(WARNING);
  });
});

describe("the ratchet over the interaction rules", () => {
  it(
    "holds every count in the baseline and lets none rise",
    async () => {
      const results = await eslint.lintFiles(["app/**/*.tsx"]);
      const measured: RuleCounts = {};
      const errors: string[] = [];
      for (const result of results) {
        const file = result.filePath.slice(process.cwd().length + 1);
        for (const message of result.messages) {
          if (!message.ruleId?.startsWith(PLUGIN_PREFIX)) continue;
          if (message.severity === ERROR) errors.push(`${message.ruleId} ${file}:${message.line}`);
          else addViolation(measured, ruleNameOf(message.ruleId), file);
        }
      }
      const ratcheted = RATCHETED_RULE_NAMES.map(ruleNameOf);
      expect(errors).toEqual([]);
      expect(Object.keys(measured).filter((rule) => !ratcheted.includes(rule))).toEqual([]);
      expect(compareToBaseline(measured, baseline, ratcheted)).toEqual([]);
    },
    LINT_TIMEOUT_MS
  );
});
