"use client";

import { ApiKeysCard } from "./ApiKeysCard";
import { McpCard } from "./McpCard";
import { SubsonicCard } from "./SubsonicCard";

export function AppsTab() {
  return (
    <>
      <SubsonicCard />
      <McpCard />
      <ApiKeysCard />
    </>
  );
}
