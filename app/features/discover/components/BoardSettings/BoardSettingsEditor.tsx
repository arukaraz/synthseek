"use client";

import { useMemo } from "react";

import { SectionLoading } from "@components/ui/SectionLoading";
import { useBoardAppearance } from "@hooks/api/queries/board/useBoardAppearance";
import { useBoardLayout } from "@hooks/api/queries/board/useBoardLayout";
import { useMyWidgets } from "@hooks/api/queries/widgets/useMyWidgets";
import { useBoardDevice } from "@hooks/ui/board/useBoardDevice";

import { boardListsOf, customStatusOf, customWidgetsById } from "../ExploreBoard/helpers";
import { BoardSettingsForm } from "./BoardSettingsForm";

export function BoardSettingsEditor() {
  const device = useBoardDevice();
  const { data, isLoading } = useBoardLayout();
  const appearance = useBoardAppearance();
  const myWidgets = useMyWidgets();
  const custom = useMemo(() => customWidgetsById(myWidgets.data), [myWidgets.data]);
  const lists = useMemo(() => boardListsOf(data, custom), [data, custom]);

  if (isLoading) return <SectionLoading />;

  return (
    <BoardSettingsForm
      lists={lists}
      device={device}
      appearance={appearance.data}
      custom={custom}
      customStatus={customStatusOf(myWidgets)}
    />
  );
}
