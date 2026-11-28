"use client";

import { useState } from "react";

import type { ConnectionCheck, ConnectionState } from "../types";

export function useConnectionCheck(): ConnectionCheck {
  const [state, setState] = useState<ConnectionState>({ kind: "untested" });

  const check = async (run: () => Promise<ConnectionState>) => {
    setState({ kind: "testing" });
    try {
      setState(await run());
    } catch {
      setState({ kind: "failed" });
    }
  };

  const reset = () => setState((previous) => (previous.kind === "untested" ? previous : { kind: "untested" }));
  const override = () => setState({ kind: "override" });

  return { state, check, reset, override };
}
