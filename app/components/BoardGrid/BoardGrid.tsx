import { boardGrid, boardGridStyle } from "./styles";
import type { BoardGridProps } from "./types";

export function BoardGrid({ device, appearance, templateRows, children }: BoardGridProps) {
  return (
    <div
      className={boardGrid({ framed: templateRows !== undefined })}
      style={boardGridStyle(device, appearance, templateRows)}
    >
      {children}
    </div>
  );
}
