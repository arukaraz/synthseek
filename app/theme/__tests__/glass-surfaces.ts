export interface GlassSurface {
  token: string;
  behind: readonly string[];
  text: readonly string[];
}

export const GLASS_SURFACES: readonly GlassSurface[] = [
  {
    token: "--glass-bg",
    behind: ["--surface-bg", "--surface-bg-elevated", "--surface-bg-overlay", "--muted"],
    text: ["--surface-fg", "--surface-fg-muted"],
  },
];
