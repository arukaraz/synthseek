"use client";

import { useTranslation } from "react-i18next";

import { SegmentTabs } from "@components/ui/SegmentTabs";

import { BoardArrangePanel } from "../BoardArrange/BoardArrangePanel";
import { AppearancePanel } from "../BoardSettings/AppearancePanel";
import { BOARD_SETTINGS_TAB_KEYS, BOARD_SETTINGS_TABS } from "../BoardSettings/constants";
import { settingsAside, settingsArrangeColumn, settingsPanel, settingsSplit } from "../BoardSettings/styles";
import { TemplatesPanel } from "../BoardSettings/TemplatesPanel";
import { StagedWidgetsContext } from "../CustomWidget/context";
import { BOARD_DEVICE_OF, BOARD_LIST_KEYS, BOARD_LISTS } from "../ExploreBoard/constants";
import { layoutTabs, settingsTabs } from "./styles";
import type { BoardSectionProps } from "./types";

export function BoardSection({
  draft,
  saved,
  list,
  onListChange,
  tab,
  onTabChange,
  boardWidth,
  customStatus,
  onStage,
}: BoardSectionProps) {
  const { t } = useTranslation(["discover", "widgets"]);

  return (
    <div className={settingsSplit()}>
      <div className={settingsArrangeColumn()}>
        <SegmentTabs
          items={BOARD_LISTS.map((value) => ({ value, label: t(BOARD_LIST_KEYS[value]) }))}
          value={list}
          onValueChange={onListChange}
          layoutId="board-layout-tab"
          ariaLabel={t("widgets:board.layouts.label")}
          className={layoutTabs()}
        />
        <StagedWidgetsContext.Provider value={draft.stagedIds}>
          <BoardArrangePanel
            key={list}
            arrange={draft.arranges[list]}
            device={BOARD_DEVICE_OF[list]}
            boardWidth={boardWidth}
            appearance={draft.shownAppearance}
            custom={draft.previewCustom}
            customStatus={customStatus}
          />
        </StagedWidgetsContext.Provider>
      </div>
      <aside className={settingsAside()}>
        <SegmentTabs
          items={BOARD_SETTINGS_TABS.map((value) => ({ value, label: t(BOARD_SETTINGS_TAB_KEYS[value]) }))}
          value={tab}
          onValueChange={onTabChange}
          layoutId="board-settings-tab"
          ariaLabel={t("widgets:board.settings.tabs")}
          className={settingsTabs()}
        />
        <div className={settingsPanel({ shown: tab === "appearance" })}>
          <AppearancePanel
            appearance={draft.shownAppearance}
            onAppearance={draft.setStyled}
            background={draft.background}
            onBackground={draft.setBackgrounds}
          />
        </div>
        <div className={settingsPanel({ shown: tab === "templates" })}>
          <TemplatesPanel lists={saved} staged={draft.staged !== null} onStage={onStage} onUnstage={draft.unstage} />
        </div>
      </aside>
    </div>
  );
}
