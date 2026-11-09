import type { BoardSettingsTab } from "../BoardSettings/types";
import type { CustomizationSection } from "../ExploreBoard/types";
import type { BoardPane, PhonePane } from "./types";

export function phonePaneOf(section: CustomizationSection, pane: BoardPane, tab: BoardSettingsTab): PhonePane {
  if (section === "widgets") return "widgets";
  return pane === "arrange" ? "arrange" : tab;
}
