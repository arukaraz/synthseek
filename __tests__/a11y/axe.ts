import axe from "axe-core";

const UNDECIDABLE_IN_JSDOM = ["color-contrast"];
const PAGE_LEVEL = [
  "region",
  "bypass",
  "document-title",
  "html-has-lang",
  "html-lang-valid",
  "html-xml-lang-mismatch",
  "landmark-one-main",
  "page-has-heading-one",
  "meta-viewport",
  "frame-tested",
];

const RUN_OPTIONS: axe.RunOptions = {
  rules: Object.fromEntries([...UNDECIDABLE_IN_JSDOM, ...PAGE_LEVEL].map((id) => [id, { enabled: false }])),
};

function describeViolation(violation: axe.Result): string {
  const targets = violation.nodes.map((node) => node.target.join(" ")).join(" | ");
  return `${violation.id} (${violation.impact ?? "unknown"}): ${violation.help} at ${targets}`;
}

export async function axeViolations(root: Element = document.body): Promise<string[]> {
  const results = await axe.run(root, RUN_OPTIONS);
  return results.violations.map(describeViolation);
}

export async function expectNoAxeViolations(root: Element = document.body): Promise<void> {
  const violations = await axeViolations(root);
  if (violations.length > 0) throw new Error(`axe found ${violations.length} violation(s):\n${violations.join("\n")}`);
}
