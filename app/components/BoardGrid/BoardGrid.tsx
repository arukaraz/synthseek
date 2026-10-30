import { boardGrid, boardGridVars } from "./styles";
import type { BoardGridProps } from "./types";

export function BoardGrid({ device, appearance, children }: BoardGridProps) {
  return (
    <div className={boardGrid()} style={boardGridVars(device, appearance)}>
      {children}
    </div>
  );
}
