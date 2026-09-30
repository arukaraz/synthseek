import { quotaSummary } from "../helpers";
import { quotaLines } from "../styles";
import type { MemberCellProps } from "../types";

export function MemberQuotaCell({ member }: MemberCellProps) {
  return (
    <div className={quotaLines()}>
      {quotaSummary(member.quota).map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}
