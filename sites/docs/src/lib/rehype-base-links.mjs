import { visit } from "unist-util-visit";

import { withBase } from "./channels.mjs";

const LINK_PROPERTIES = { a: "href", img: "src" };

export function rehypeBaseLinks(base) {
  return () => (tree) => {
    if (base === "/") return;
    visit(tree, "element", (node) => {
      const property = LINK_PROPERTIES[node.tagName];
      const value = property && node.properties?.[property];
      if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return;
      node.properties[property] = withBase(base, value);
    });
  };
}
