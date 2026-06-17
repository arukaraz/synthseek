"use client";

import { visibleFacts } from "../../helpers";
import {
  factBullet,
  factBulletItem,
  factBulletList,
  factLabel,
  factListRow,
  factRow,
  factsList,
  factValue,
} from "../../styles";
import type { DetailsFactsProps } from "./types";

export function DetailsFacts({ facts }: DetailsFactsProps) {
  const rows = visibleFacts(facts);
  if (rows.length === 0) return null;

  return (
    <dl className={factsList()}>
      {rows.map((fact) =>
        fact.items ? (
          <div key={fact.label} className={factListRow()}>
            <dt className={factLabel()}>{fact.label}</dt>
            <dd>
              <ul className={factBulletList()}>
                {fact.items.map((item) => (
                  <li key={item} className={factBulletItem()}>
                    <span className={factBullet()} aria-hidden>
                      &bull;
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
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
