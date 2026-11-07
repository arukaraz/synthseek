import { createContext } from "react";

export const StagedWidgetsContext = createContext<ReadonlySet<string>>(new Set());
