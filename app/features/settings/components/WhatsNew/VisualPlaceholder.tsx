import { Sparkles } from "lucide-react";

import { visual, visualIcon } from "./styles";

export function VisualPlaceholder() {
  return (
    <div className={visual()} aria-hidden>
      <Sparkles className={visualIcon()} />
    </div>
  );
}
