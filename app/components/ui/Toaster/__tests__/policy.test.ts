import { afterEach, describe, expect, it } from "vitest";
import { toast } from "sonner";

import type { A11yToastDuration } from "@modules/accessibility";

import { resolveToastCallDuration } from "../helpers";
import { installToastPolicy, setToastPolicy, withToastPolicy } from "../policy";
import type { ToastKind } from "../types";

const FOREVER = Number.POSITIVE_INFINITY;

describe("resolveToastCallDuration", () => {
  it.each<[A11yToastDuration, boolean, ToastKind, boolean, number | undefined, number | undefined]>([
    ["default", false, "error", false, undefined, undefined],
    ["default", false, "error", false, 12000, 12000],
    ["default", false, "info", true, 8000, 8000],
    ["default", true, "error", false, undefined, FOREVER],
    ["default", true, "error", false, 12000, FOREVER],
    ["default", true, "success", true, 8000, FOREVER],
    ["default", true, "info", false, undefined, undefined],
    ["default", true, "info", false, 2000, 4000],
    ["default", true, "warning", false, 12000, 12000],
    ["2", true, "error", false, undefined, 2000],
    ["8", false, "info", false, 3000, 8000],
    ["sticky", false, "info", false, undefined, FOREVER],
    ["sticky", true, "warning", false, 12000, FOREVER],
  ])("choice %s, mode %s, %s, action %s, explicit %s gives %s", (choice, mode, kind, hasAction, explicit, expected) => {
    expect(resolveToastCallDuration({ choice, mode, kind, hasAction, explicit })).toBe(expected);
  });
});

describe("withToastPolicy", () => {
  afterEach(() => {
    setToastPolicy({ choice: "default", mode: false });
  });

  it("returns the very same options when nothing changes, so the mode off is today's behaviour", () => {
    const data = { duration: 8000, description: "x" };
    expect(withToastPolicy("error", data)).toBe(data);
    expect(withToastPolicy("info", undefined)).toBeUndefined();
  });

  it("keeps an action toast open inside the mode", () => {
    setToastPolicy({ choice: "default", mode: true });
    const action = { label: "Undo", onClick: () => undefined };
    expect(withToastPolicy("success", { action, duration: 8000 })?.duration).toBe(FOREVER);
  });

  it("lets the member's choice replace an explicit duration", () => {
    setToastPolicy({ choice: "4", mode: false });
    expect(withToastPolicy("warning", { duration: 12000 })?.duration).toBe(4000);
  });
});

describe("installToastPolicy", () => {
  afterEach(() => {
    setToastPolicy({ choice: "default", mode: false });
    toast.dismiss();
  });

  it("applies the policy to every call on the shared toast object", () => {
    installToastPolicy();
    setToastPolicy({ choice: "default", mode: true });

    const id = toast.error("The save failed");
    const raised = toast.getToasts().find((entry) => entry.id === id);

    expect(raised).toMatchObject({ duration: FOREVER });
  });

  it("leaves an informational toast without a duration when the mode is off", () => {
    installToastPolicy();

    const id = toast.info("Saved");
    const raised = toast.getToasts().find((entry) => entry.id === id);

    expect(raised).not.toHaveProperty("duration");
  });
});
