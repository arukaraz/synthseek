"use client";

import { useUrlParam } from "@hooks/ui/useUrlParam";
import { AnimatePresence, motion } from "framer-motion";
import { GroupsViewMode } from "./components/GroupsViewMode";
import { ListViewMode } from "./components/ListViewMode";
import { Toolbar } from "./components/Toolbar/Toolbar";
import { requestsView } from "./components/styles";
import { REQUESTS_URL_PARAMS } from "./types";

export function RequestsScreen() {
  const [viewMode] = useUrlParam("view", REQUESTS_URL_PARAMS.view);

  return (
    <div className={requestsView()}>
      <Toolbar />

      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {viewMode === "groups" ? <GroupsViewMode /> : <ListViewMode />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
