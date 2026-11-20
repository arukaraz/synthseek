import { field, fieldLabel } from "./styles";
import type { WorkshopFieldProps } from "./types";

export function WorkshopField({ label, children }: WorkshopFieldProps) {
  return (
    <section className={field()}>
      <h3 className={fieldLabel()}>{label}</h3>
      {children}
    </section>
  );
}
