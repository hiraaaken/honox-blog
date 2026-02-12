import { visit } from "unist-util-visit";
import { toString } from "hast-util-to-string";
import type { Root, Element } from "hast";

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/**
 * MDX コンパイル時に見出し（h2, h3）を抽出し、export として追加する rehype プラグイン
 *
 * rehype-slug の後に実行する必要がある（ID が付与された後に抽出するため）
 */
export function rehypeExtractHeadings() {
  return (tree: Root) => {
    const headings: Heading[] = [];

    // HAST を走査して h2, h3 を抽出
    visit(tree, "element", (node: Element) => {
      if (["h2", "h3"].includes(node.tagName)) {
        const id = node.properties?.id as string | undefined;
        const text = toString(node);
        const level = parseInt(node.tagName[1]);

        if (id && text) {
          headings.push({ id, text, level });
        }
      }
    });

    // MDX ESM export ノードを追加
    // `export const headings = [...]` として出力される
    tree.children.unshift({
      type: "mdxjsEsm",
      value: `export const headings = ${JSON.stringify(headings)};`,
      data: {
        estree: {
          type: "Program",
          sourceType: "module",
          body: [
            {
              type: "ExportNamedDeclaration",
              declaration: {
                type: "VariableDeclaration",
                kind: "const",
                declarations: [
                  {
                    type: "VariableDeclarator",
                    id: { type: "Identifier", name: "headings" },
                    init: {
                      type: "ArrayExpression",
                      elements: headings.map((h) => ({
                        type: "ObjectExpression",
                        properties: [
                          {
                            type: "Property",
                            key: { type: "Identifier", name: "id" },
                            value: { type: "Literal", value: h.id },
                            kind: "init",
                            method: false,
                            shorthand: false,
                            computed: false,
                          },
                          {
                            type: "Property",
                            key: { type: "Identifier", name: "text" },
                            value: { type: "Literal", value: h.text },
                            kind: "init",
                            method: false,
                            shorthand: false,
                            computed: false,
                          },
                          {
                            type: "Property",
                            key: { type: "Identifier", name: "level" },
                            value: { type: "Literal", value: h.level },
                            kind: "init",
                            method: false,
                            shorthand: false,
                            computed: false,
                          },
                        ],
                      })),
                    },
                  },
                ],
              },
              specifiers: [],
              source: null,
            },
          ],
        },
      },
    } as any);
  };
}
