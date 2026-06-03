import { cva } from "class-variance-authority";

export const authSceneRoot = cva("auth-stage pointer-events-none fixed inset-0 z-0 overflow-hidden");

export const authGrid = cva("absolute inset-0 auth-grid");

export const authOrb = cva(
  "auth-orb absolute top-1/2 left-1/2 h-[20rem] w-[20rem] rounded-full sm:h-[35rem] sm:w-[35rem]"
);
