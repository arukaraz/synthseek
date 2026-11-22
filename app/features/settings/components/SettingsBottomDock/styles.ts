import { cva } from "class-variance-authority";

import { columnFrame } from "../../styles";

export const bottomDock = cva("sticky bottom-0 z-20 mt-auto flex flex-col");

export const bottomDockContent = cva([columnFrame(), "pb-2.5"]);
