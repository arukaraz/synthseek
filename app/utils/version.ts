export const PATCH_NOTES_URL = "https://github.com/arukaraz/synthseek/blob/main/PATCH-NOTES.md";

interface SemverParts {
  major: number;
  minor: number;
  patch: number;
}

function parseSemver(version: string): SemverParts | null {
  if (typeof version !== "string") return null;
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  const [, majorStr, minorStr, patchStr] = match;
  if (majorStr === undefined || minorStr === undefined || patchStr === undefined) return null;
  const major = Number.parseInt(majorStr, 10);
  const minor = Number.parseInt(minorStr, 10);
  const patch = Number.parseInt(patchStr, 10);
  if (Number.isNaN(major) || Number.isNaN(minor) || Number.isNaN(patch)) return null;
  return { major, minor, patch };
}

export function isBreakingUpdate(current: string | null | undefined, latest: string | null | undefined): boolean {
  if (!current || !latest) return false;
  const c = parseSemver(current);
  const l = parseSemver(latest);
  if (c === null || l === null) return false;
  return l.major > c.major;
}
