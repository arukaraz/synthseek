"use client";

import { visibleFacts } from "../../helpers";
import { factLabel, factRow, factsList, factValue } from "../../styles";
import { FactList } from "./FactList";
import type { DetailsFactsProps } from "./types";

export function DetailsFacts({ facts }: DetailsFactsProps) {
  const rows = visibleFacts(facts);
  if (rows.length === 0) return null;

  return (
    <dl className={factsList()}>
      {rows.map((fact) =>
        fact.items ? (
          <FactList key={fact.label} label={fact.label} items={fact.items} />
        ) : (
          <div key={fact.label} className={factRow()}>
            <dt className={factLabel()}>{fact.label}</dt>
            <dd className={factValue()}>{fact.value}</dd>
          </div>
        )
      )}
    </dl>
  );
}
