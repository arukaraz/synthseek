import { cva } from "class-variance-authority";

export const bottomDock = cva("sticky bottom-0 z-20 mt-auto flex flex-col");

export const bottomDockContent = cva("mx-auto w-full max-w-3xl px-4 pb-2.5 sm:px-6 lg:max-w-6xl lg:px-10");
