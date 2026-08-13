"use client";

import { Suspense } from "react";
import { GroupsViewMode } from "./components/GroupsViewMode";
import { RequestsActivityDivider } from "./components/RequestsActivityDivider";
import { SpotifyCallbackToast } from "./components/SpotifyCallbackToast";
import { StorageFailureNotice } from "./components/StorageFailureNotice";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { requestsView } from "./components/styles";

export function RequestsScreen() {
  return (
    <div className={requestsView()}>
      <Suspense fallback={null}>
        <SpotifyCallbackToast />
      </Suspense>
      <RequestsActivityDivider>
        <Toolbar />
      </RequestsActivityDivider>

      <StorageFailureNotice />

      <div className="flex-1 overflow-auto">
        <GroupsViewMode />
      </div>
    </div>
  );
}
