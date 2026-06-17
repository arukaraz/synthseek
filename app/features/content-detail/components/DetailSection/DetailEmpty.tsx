"use client";

import { sectionEmpty } from "../../styles";
import type { DetailEmptyProps } from "../../types";

export function DetailEmpty({ message }: DetailEmptyProps) {
  return <p className={sectionEmpty()}>{message}</p>;
}
