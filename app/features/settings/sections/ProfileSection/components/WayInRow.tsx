import { listeningRowHeader, waysInRow, waysInStatus } from "../styles";
import type { WayInRowProps } from "../types";

export function WayInRow({ name, status, children }: WayInRowProps) {
  return (
    <li className={waysInRow()}>
      <div className={listeningRowHeader()}>
        <div className="min-w-0 flex-1">
          <p className="text-fg text-sm font-medium">{name}</p>
          <p className={waysInStatus()}>{status}</p>
        </div>
        {children}
      </div>
    </li>
  );
}
