"use client";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { ApiCard } from "./ApiCard";
import { ThemeCard } from "./ThemeCard";

export function GeneralSection() {
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="General" />
      <ThemeCard />
      <ApiCard />
    </div>
  );
}
