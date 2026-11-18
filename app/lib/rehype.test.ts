import { describe, expect, test } from "vite-plus/test";
import type { Element, ElementContent, Root } from "hast";
import { rehypeExtractHeadings } from "./rehype-extract-headings";
import { rehypeWrapTables } from "./rehype-wrap-tables";

const el = (
  tagName: string,
  properties: Element["properties"] = {},
  children: ElementContent[] = [],
): Element => ({ type: "element", tagName, properties, children });

const text = (value: string): ElementContent => ({ type: "text", value });

const root = (...children: Root["children"]): Root => ({ type: "root", children });

describe("rehypeWrapTables", () => {
  test("table を div.table-wrapper で包む", () => {
    const table = el("table");
    const tree = root(el("p"), table);
    rehypeWrapTables()(tree);

    expect(tree.children[0]).toMatchObject({ tagName: "p" });
    expect(tree.children[1]).toEqual(el("div", { className: ["table-wrapper"] }, [table]));
  });

  test("入れ子の位置にある table も包み、二重には包まない", () => {
    const first = el("table");
    const second = el("table");
    const tree = root(el("section", {}, [first, second]));
    rehypeWrapTables()(tree);

    const section = tree.children[0] as Element;
    expect(section.children).toEqual([
      el("div", { className: ["table-wrapper"] }, [first]),
      el("div", { className: ["table-wrapper"] }, [second]),
    ]);
  });

  test("table が無ければ何も変えない", () => {
    const tree = root(el("p", {}, [text("x")]));
    const before = structuredClone(tree);
    rehypeWrapTables()(tree);
    expect(tree).toEqual(before);
  });
});

describe("rehypeExtractHeadings", () => {
  type EsmNode = { type: "mdxjsEsm"; value: string; data: { estree: unknown } };

  const run = (tree: Root) => {
    rehypeExtractHeadings()(tree);
    const esm = tree.children[0] as unknown as EsmNode;
    const json = esm.value.replace(/^export const headings = /, "").replace(/;$/, "");
    return { esm, headings: JSON.parse(json) as unknown[] };
  };

  test("id のある h2 / h3 を出現順に抜き出す", () => {
    const { headings } = run(
      root(
        el("h2", { id: "intro" }, [text("はじめに")]),
        el("h3", { id: "detail" }, [text("詳細 "), el("code", {}, [text("calc()")])]),
        el("h4", { id: "deep" }, [text("深い")]),
        el("h2", { id: "summary" }, [text("まとめ")]),
      ),
    );
    expect(headings).toEqual([
      { id: "intro", text: "はじめに", level: 2 },
      { id: "detail", text: "詳細 calc()", level: 3 },
      { id: "summary", text: "まとめ", level: 2 },
    ]);
  });

  test("id か文字が無い見出しは目次に入れない", () => {
    const { headings } = run(root(el("h2", {}, [text("idなし")]), el("h2", { id: "empty" })));
    expect(headings).toEqual([]);
  });

  // MDX は value ではなく estree を見てコードを生成する。両者が食い違うと目次が壊れる
  test("estree が value と同じ値を表す", () => {
    const { esm, headings } = run(
      root(el("h2", { id: "a" }, [text("A")]), el("h3", { id: "b" }, [text("B")])),
    );

    type Literal = { value: unknown };
    type Prop = { key: { name: string }; value: Literal };
    type Program = {
      body: [{ declaration: { declarations: [{ init: { elements: { properties: Prop[] }[] } }] } }];
    };
    const program = esm.data.estree as Program;
    const fromEstree = program.body[0].declaration.declarations[0].init.elements.map((obj) =>
      Object.fromEntries(obj.properties.map((p) => [p.key.name, p.value.value])),
    );
    expect(fromEstree).toEqual(headings);
  });

  test("export は先頭に挿入され、既存の木を残す", () => {
    const tree = root(el("h2", { id: "a" }, [text("A")]));
    rehypeExtractHeadings()(tree);
    expect(tree.children).toHaveLength(2);
    expect(tree.children[0].type).toBe("mdxjsEsm");
    expect(tree.children[1]).toMatchObject({ tagName: "h2" });
  });
});
