import { statusStripAction } from "../styles";
import type { ConnectionStatusProps } from "../types";
import { StatusStrip } from "./StatusStrip";

export function ConnectionStatus({ state, passedText, failedText, override }: ConnectionStatusProps) {
  if (state.kind === "passed") return <StatusStrip tone="success" message={passedText} />;
  if (state.kind === "override" && override) return <StatusStrip tone="neutral" message={override.armedText} />;
  if (state.kind !== "failed") return null;

  return (
    <StatusStrip
      tone="error"
      message={state.reason ?? failedText}
      action={
        override ? (
          <button type="button" onClick={override.onArm} className={statusStripAction()}>
            {override.label}
          </button>
        ) : undefined
      }
    />
  );
}
