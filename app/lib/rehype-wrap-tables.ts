import { visit, SKIP } from "unist-util-visit";
import type { Root, Element } from "hast";

/**
 * table 要素を div.table-wrapper で包む rehype プラグイン
 *
 * postContent の CSS は `.table-wrapper table { display: table; }` を前提に
 * 横スクロール可能なラッパーを組んでいるため、この変換がないと
 * table 単体の `display: block` が列幅計算を壊してレイアウトが崩れる
 */
export function rehypeWrapTables() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, index, parent) => {
      if (node.tagName !== "table" || parent == null || index == null) {
        return;
      }

      const wrapper: Element = {
        type: "element",
        tagName: "div",
        properties: { className: ["table-wrapper"] },
        children: [node],
      };

      parent.children[index] = wrapper;
      return SKIP;
    });
  };
}
