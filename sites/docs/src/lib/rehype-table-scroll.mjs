import { visit } from "unist-util-visit";

export function rehypeTableScroll() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "table" || !parent || index === null) return;
      if (parent.type === "element" && parent.properties?.className?.includes("dx-table")) return;

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["dx-table"] },
        children: [node],
      };
    });
  };
}
