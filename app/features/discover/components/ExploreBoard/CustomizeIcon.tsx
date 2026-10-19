import { LayoutGrid, Pencil } from "lucide-react";

import { editIconFrame, editIconGlyph, editIconPen, editIconPenGlyph } from "./styles";

export function CustomizeIcon() {
  return (
    <span className={editIconFrame()} aria-hidden>
      <LayoutGrid className={editIconGlyph()} />
      <span className={editIconPen()}>
        <Pencil className={editIconPenGlyph()} />
      </span>
    </span>
  );
}
