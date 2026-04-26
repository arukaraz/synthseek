"use client";

import { SettingsSidebar } from "./SettingsSidebar";
import { AppearancePanel, LanguageRegionPanel } from "./sections/GeneralSection/AppearancePanel";
import { MembersSection } from "./sections/MembersSection/MembersSection";
import { PlaceholderPanel } from "./sections/placeholders";
import { contentRoot, layoutRoot } from "./styles";
import type { SettingsSection } from "./types";

interface SettingsLayoutProps {
  section: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

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
      return <MembersSection />;
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
