import { describe, expect, it } from "vitest";

import { addViolation, compareToBaseline, type RuleCounts } from "./ratchet";

const RULE = "no-static-element-interactions";

describe("compareToBaseline", () => {
  const baseline: RuleCounts = { [RULE]: { "a.tsx": 2, "b.tsx": 1 } };

  it("accepts the counts the baseline holds", () => {
    expect(compareToBaseline({ [RULE]: { "a.tsx": 2, "b.tsx": 1 } }, baseline, [RULE])).toEqual([]);
  });

  it("fails when a count rises", () => {
    const problems = compareToBaseline({ [RULE]: { "a.tsx": 3, "b.tsx": 1 } }, baseline, [RULE]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("a.tsx has 3");
  });

  it("fails when a file outside the baseline gains a violation", () => {
    const problems = compareToBaseline({ [RULE]: { "a.tsx": 2, "b.tsx": 1, "c.tsx": 1 } }, baseline, [RULE]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("c.tsx has 1, the baseline allows 0");
  });

  it("fails when a count fell and the baseline was not lowered", () => {
    const problems = compareToBaseline({ [RULE]: { "a.tsx": 2 } }, baseline, [RULE]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("b.tsx fell to 0");
  });

  it("fails on a ratcheted rule that no longer has a violation", () => {
    const problems = compareToBaseline({}, {}, [RULE]);
    expect(problems).toEqual([`${RULE}: no violations left, promote it to an error`]);
  });
});

describe("addViolation", () => {
  it("counts per rule and file", () => {
    const counts: RuleCounts = {};
    addViolation(counts, RULE, "a.tsx");
    addViolation(counts, RULE, "a.tsx");
    addViolation(counts, RULE, "b.tsx");
    expect(counts).toEqual({ [RULE]: { "a.tsx": 2, "b.tsx": 1 } });
  });
});
