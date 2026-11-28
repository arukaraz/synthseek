"use client";

import { useLayoutEffect, useState } from "react";

import { CLAMP_OVERFLOW_TOLERANCE_PX } from "./constants";

export function useClampedOverflow<T extends HTMLElement>(
  content: string,
  clamped: boolean
): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [cut, setCut] = useState(false);

  useLayoutEffect(() => {
    if (node === null || !clamped) return;
    const measure = () => setCut(node.scrollHeight - node.clientHeight > CLAMP_OVERFLOW_TOLERANCE_PX);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [node, content, clamped]);

  return [setNode, node !== null && cut];
}
