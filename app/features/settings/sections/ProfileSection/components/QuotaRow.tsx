import { quotaLabel, quotaNote, quotaRow, quotaValue } from "../styles";
import type { QuotaRowProps } from "../types";

export function QuotaRow({ label, value, note }: QuotaRowProps) {
  return (
    <div className={quotaRow()}>
      <span className={quotaLabel()}>{label}</span>
      <span className={quotaValue()}>{value}</span>
      {note ? <span className={quotaNote()}>{note}</span> : null}
    </div>
  );
}
