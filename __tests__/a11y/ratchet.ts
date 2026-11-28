export type RuleCounts = Record<string, Record<string, number>>;

export function addViolation(counts: RuleCounts, rule: string, file: string): void {
  counts[rule] ??= {};
  counts[rule][file] = (counts[rule][file] ?? 0) + 1;
}

export function compareToBaseline(measured: RuleCounts, baseline: RuleCounts, ratcheted: string[]): string[] {
  const problems: string[] = [];
  for (const rule of ratcheted) {
    const now = measured[rule] ?? {};
    const before = baseline[rule] ?? {};
    for (const file of Object.keys(now)) {
      const allowed = before[file] ?? 0;
      if (now[file] > allowed) problems.push(`${rule}: ${file} has ${now[file]}, the baseline allows ${allowed}`);
    }
    for (const file of Object.keys(before)) {
      if ((now[file] ?? 0) < before[file]) {
        problems.push(`${rule}: ${file} fell to ${now[file] ?? 0}, lower the baseline from ${before[file]}`);
      }
    }
    if (Object.keys(before).length === 0) problems.push(`${rule}: no violations left, promote it to an error`);
  }
  return problems;
}
