"use client";

import { useEffect, useState } from "react";

export function useElementHeight<T extends HTMLElement>(): [(node: T | null) => void, number] {
  const [node, setNode] = useState<T | null>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (node === null) return;
    const observer = new ResizeObserver(() => setHeight(node.offsetHeight));
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);

  return [setNode, node === null ? 0 : height];
}
