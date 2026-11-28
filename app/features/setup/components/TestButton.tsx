import { Plug } from "lucide-react";

import { setupActionIcon, testButton, testRow } from "../styles";
import type { TestButtonProps } from "../types";

export function TestButton({ testing, disabled, idleLabel, busyLabel, onTest }: TestButtonProps) {
  return (
    <div className={testRow()}>
      <button
        type="button"
        onClick={onTest}
        disabled={disabled || testing}
        aria-busy={testing || undefined}
        className={testButton()}
      >
        <Plug aria-hidden="true" className={setupActionIcon()} />
        {testing ? busyLabel : idleLabel}
      </button>
    </div>
  );
}
