export type SettingsSection =
  | "general.language"
  | "general.appearance"
  | "members"
  | "profile"
  | "advanced.logs"
  | "advanced.report"
  | "advanced.formatting";

export const DEFAULT_SETTINGS_SECTION: SettingsSection = "general.appearance";

export interface SettingsGroup {
  id: "general" | "members" | "profile" | "advanced";
  label: string;
  icon: "settings" | "users" | "user" | "settings2";
  items?: Array<{ id: SettingsSection; label: string }>;
}

export const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    id: "general",
    label: "General",
    icon: "settings",
    items: [
      { id: "general.language", label: "Language & Region" },
      { id: "general.appearance", label: "Appearance" },
    ],
  },
  {
    id: "members",
    label: "Members",
    icon: "users",
  },
  {
    id: "profile",
    label: "Profile",
    icon: "user",
  },
  {
    id: "advanced",
    label: "Advanced",
    icon: "settings2",
    items: [
      { id: "advanced.logs", label: "Logs" },
      { id: "advanced.report", label: "Report a bug" },
      { id: "advanced.formatting", label: "Formatting" },
    ],
  },
];
