import { cva } from "class-variance-authority";

import { widgetList } from "../WidgetRow/styles";

export const chartsList = cva(widgetList());

export const chartRank = cva(
  "from-primary-300 to-accent-400 bg-linear-to-b bg-clip-text font-mono text-base font-bold text-transparent tabular-nums"
);
