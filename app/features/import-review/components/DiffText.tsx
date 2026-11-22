"use client";

import { Fragment } from "react";

import { diffAdded, diffRemoved } from "../styles";
import type { DiffTextProps } from "../types";

export function DiffText({ tokens, side }: DiffTextProps) {
  return (
    <>
      {tokens.map((token, index) => (
        <Fragment key={`${index}-${token.text}`}>
          {index > 0 ? " " : null}
          {token.changed ? (
            side === "found" ? (
              <mark className={diffAdded()}>{token.text}</mark>
            ) : (
              <del className={diffRemoved()}>{token.text}</del>
            )
          ) : (
            token.text
          )}
        </Fragment>
      ))}
    </>
  );
}
