"use client";

import { useEffect, useState } from "react";

export function useOverflowsX<T extends HTMLElement>(): [(node: T | null) => void, boolean] {
  const [node, setNode] = useState<T | null>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    if (node === null) return;
    const observer = new ResizeObserver(() => setOverflows(node.scrollWidth > node.clientWidth));
    observer.observe(node);
    Array.from(node.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [node]);

  return [setNode, node !== null && overflows];
}
