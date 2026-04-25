"use client";

import { SettingsSidebar } from "./SettingsSidebar";
import { AppearancePanel, LanguageRegionPanel } from "./sections/GeneralSection/AppearancePanel";
import { PlaceholderPanel } from "./sections/placeholders";
import { contentRoot, layoutRoot } from "./styles";
import type { SettingsSection } from "./types";

interface SettingsLayoutProps {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

/**
 * Pure layout (sidebar + content). The modal wrapper is a thin layer in
 * SettingsModal.tsx — when the feature promotes to a route, render this
 * component directly in /settings/page.tsx.
 */
export function SettingsLayout({ section, onSectionChange }: SettingsLayoutProps) {
  return (
    <div className={layoutRoot()}>
      <SettingsSidebar section={section} onSelect={onSectionChange} />
      <div className={contentRoot()}>{renderSection(section)}</div>
    </div>
  );
}

function renderSection(section: SettingsSection) {
  switch (section) {
    case "general.appearance":
      return <AppearancePanel />;
    case "general.language":
      return <LanguageRegionPanel />;
    case "members":
      return <PlaceholderPanel title="Members" description="Manage users and invitations." />;
    case "profile":
      return <PlaceholderPanel title="Profile" description="Account details and preferences." />;
    case "advanced.logs":
      return <PlaceholderPanel title="Logs" description="Recent server logs." />;
    case "advanced.report":
      return <PlaceholderPanel title="Report a bug" description="Share issues with the maintainers." />;
    case "advanced.formatting":
      return <PlaceholderPanel title="Formatting" description="Library formatting options." />;
  }
}
