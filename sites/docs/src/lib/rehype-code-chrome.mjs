import { visit } from "unist-util-visit";

export function rehypeCodeChrome() {
  return (tree) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || !parent || index === null) return;
      if (node.properties?.dataWrapped) return;

      const language = String(node.properties?.dataLanguage ?? "code");
      node.properties = { ...node.properties, dataWrapped: true };

      parent.children[index] = {
        type: "element",
        tagName: "div",
        properties: { className: ["dx-code"], "data-dx-code": true },
        children: [
          {
            type: "element",
            tagName: "div",
            properties: { className: ["dx-code-head"] },
            children: [
              {
                type: "element",
                tagName: "span",
                properties: { className: ["dx-code-lang"] },
                children: [{ type: "text", value: language }],
              },
              {
                type: "element",
                tagName: "button",
                properties: {
                  type: "button",
                  className: ["dx-code-copy"],
                  "data-dx-copy": true,
                  "aria-label": "Copy code",
                },
                children: [{ type: "text", value: "Copy" }],
              },
            ],
          },
          node,
        ],
      };
    });
  };
}
