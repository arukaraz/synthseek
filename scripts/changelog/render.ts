import { CALLOUT_ADMONITION, DOCUMENT_TITLE, MONTH_NAMES, SECTION_SEPARATOR } from "./constants";
import type { Changelog, ChangelogCallout, ChangelogSection, ChangelogVersion } from "./types";

const BLOCK_GAP = "\n\n";
const SECTION_GAP = `${BLOCK_GAP}${SECTION_SEPARATOR}${BLOCK_GAP}`;

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-").map((part) => Number(part));
  const monthName = MONTH_NAMES[month - 1];
  if (!monthName || Number.isNaN(year) || Number.isNaN(day)) {
    throw new Error(`Invalid changelog date: ${iso}`);
  }
  return `${monthName} ${day}, ${year}`;
}

function renderCallout(callout: ChangelogCallout): string {
  const label = CALLOUT_ADMONITION[callout.level];
  const quoted = callout.body
    .split("\n")
    .map((line) => (line.length === 0 ? ">" : `> ${line}`))
    .join("\n");
  return `> [!${label}]\n${quoted}`;
}

function renderSection(section: ChangelogSection, heading: string | undefined): string {
  const parts: string[] = [];
  if (heading) {
    parts.push(`### ${heading}`);
  }
  if (section.body) {
    parts.push(section.body);
  }
  if (section.items && section.items.length > 0) {
    parts.push(section.items.map((item) => `- ${item}`).join("\n"));
  }
  return parts.join(BLOCK_GAP);
}

function renderVersion(version: ChangelogVersion): string {
  const blocks: string[] = [`# v${version.version}, ${formatDate(version.date)}`];

  if (version.callouts && version.callouts.length > 0) {
    blocks.push(version.callouts.map(renderCallout).join(BLOCK_GAP));
  }

  const sections = version.sections ?? [];
  if (sections.length > 0) {
    let body = renderSection(sections[0], version.title);
    for (let index = 1; index < sections.length; index += 1) {
      const section = sections[index];
      const gap = section.heading ? SECTION_GAP : BLOCK_GAP;
      body += `${gap}${renderSection(section, section.heading)}`;
    }
    blocks.push(body);
  }

  return blocks.join(BLOCK_GAP);
}

export function renderChangelog(changelog: Changelog): string {
  const versions = changelog.versions.map(renderVersion).join(SECTION_GAP);
  return `${DOCUMENT_TITLE}${SECTION_GAP}${versions}\n`;
}
