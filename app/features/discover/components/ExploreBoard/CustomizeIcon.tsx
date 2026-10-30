import { Pencil } from "lucide-react";

import { editIcon } from "./styles";

export function CustomizeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={editIcon()}
      aria-hidden
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <Pencil x={12.5} y={12.5} size={11} strokeWidth={3.6} />
    </svg>
  );
}
