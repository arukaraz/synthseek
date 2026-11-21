"use client";

import { memo } from "react";

import { ColorRow } from "./ColorRow";
import { FontRow } from "./FontRow";
import { NumberRow } from "./NumberRow";
import type { TokenRowProps } from "./types";

function TokenRowComponent({ token, other, following, families, onEditInCss, ...base }: TokenRowProps) {
  if (token.kind === "color") {
    return <ColorRow {...base} token={token} other={other} following={following} onEditInCss={onEditInCss} />;
  }
  if (token.kind === "font") return <FontRow {...base} token={token} families={families} />;
  return <NumberRow {...base} token={token} onEditInCss={onEditInCss} />;
}

export const TokenRow = memo(TokenRowComponent);
