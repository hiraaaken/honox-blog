# デザインシステム

トークンは `app/styles/layers/` で管理する。

| ファイル | レイヤー | 役割 |
|---|---|---|
| `tokens.css` | `tokens` | Primitive / Semantic / Foundation |
| `base.css` | `base` | リセットと要素の既定 |
| `components.css` | `components` | Component トークンと出し分け |
| `utilities.css` | `utilities` | ユーティリティ |

---

## テーマ

### 3状態ある

閲覧者の状態は2つではなく3つ。**`data-theme` が付かない「システム設定に従う」状態が最も多い。**

```css
:root                     { color-scheme: light dark; }  /* ① 未指定 = システムに従う */
:root[data-theme="light"] { color-scheme: light; }       /* ② 明示的にライト */
:root[data-theme="dark"]  { color-scheme: dark; }        /* ③ 明示的にダーク */
```

`light-dark()` は `color-scheme` の計算値を見るので、**トークンは `light-dark()` で1回書くだけで3状態が解決する**。テーマごとにトークン集合を再定義してはいけない。同じ集合を2箇所で持つと片方だけ古い値が残る。

②の行は必須。無いと「OS はダークだが明示的にライトを選んだ人」が `light dark` の解決でダークに落ちる。

> **`.dark` のようなクラスでテーマを持たせない。**
> クラスでは「システム設定に従う」を表現できない（`:root:not(.dark)` に相当する書き方が無い）。

### 切り替え

**正は `localStorage` ただ一つ。サーバは `data-theme` を決めない。**

cookie で持ってはいけない。`vite.config.ts` の `@hono/vite-ssg` が `/` `/posts` `/tags` `/about` を静的 HTML として `dist/` に吐き、`wrangler.jsonc` の `assets` 設定により Workers Assets が Worker より先に応答する（`run_worker_first` の既定は false）。**これらのパスでは Worker が起動しないので、サーバは cookie を読めない。** 実際それで切り替えが効かなくなっていた（#78）。

```
GET /                     → dist/index.html（Worker は起動しない）
GET /posts/:slug          → Worker が起動する
```

サイトの半分がサーバを通らない以上、cookie は権威を持てない。静的・動的どちらのページでも同じに読める場所は `localStorage` しかない。

| 置き場所 | 役割 |
|---|---|
| `app/lib/theme.ts` | 3状態の定義と、`<head>` に入る初期化スクリプト |
| `app/components/ThemeToggle.tsx` | 3分割セグメント。マークアップだけを持つ |
| `components.css` | どのセグメントが選択中かの出し分け |

`_renderer.tsx` は `<head>` に**同期スクリプトを1つ**置く。役割は5つ。

1. 描画前に `data-theme` を確定させる
2. クリックを `document` で委譲して受ける
3. 矢印キーで選択とフォーカスを動かす（radiogroup のキーボード規約）
4. `aria-checked` と `tabindex` を選択状態に合わせる
5. 別タブでの変更に `storage` イベントで追従する

切り替えにサーバ往復は無い＝**画面は再読み込みされない**。

> **`type="module"` にはできない。**
> モジュールは**常に defer される**ので描画前に走らず、ちらつきを防げない。
> ここだけは今でもクラシックスクリプト一択で、`client.ts`（`async`）でも間に合わない。
>
> ```
> クラシックスクリプト実行時に body が存在したか: false   ← 描画前
> module がクラシックより後に走ったか:            true   ← 手遅れ
> ```

> **`matchMedia` で OS 設定を監視しない。**
> `system` を選んでいる閲覧者の配色は、`color-scheme: light dark` と `light-dark()` が
> **CSS だけで** OS 設定の変化に追従する。JS で張るリスナーは丸ごと無駄になる。

### `var` を使わない

このサイトの下限は `light-dark()` が決めている（Baseline low / 2024-05-13、Chrome 123・
Firefox 120・Safari 17.5）。無いとトークンが全部無効値になって配色が崩壊するので、
**そこで `const` / `let` が動かないことはあり得ない。** `<head>` 直書きのテーマスクリプトに
`var` と IIFE が付いている定型は IE 対応の化石で、ブロックスコープで足りる。

### 相互排他なので radiogroup にする

3つのセグメントは「3つの独立したトグル」ではなく「3つのうち1つ」。
`role="group"` + `aria-pressed` で書くと、支援技術にはその情報が落ちる。

```
役割:     role="radiogroup" / role="radio" / aria-checked
キー操作: 矢印キーで選択とフォーカスが同時に動く（端で回り込む）
タブ:     グループ全体で1つのタブストップ（roving tabindex）
```

`tabindex` はサーバが既定（`system`）を `0`、残りを `-1` で描き、
保存値が違う閲覧者の分はスクリプトが読み込み時に直す。

### 切り替えは View Transition でクロスフェードする

`document.startViewTransition()`（Baseline low / 2025-10-14、Chrome 111・Firefox 144・
Safari 18）。非対応なら即座に切り替わるだけで、壊れない。

`prefers-reduced-motion: reduce` は**二重に**尊重する。JS 側で `startViewTransition` を
呼ばず、CSS 側でも `::view-transition-*` のアニメーションを止める（`base.css`）。

> **View Transition を挟むと `data-theme` の反映が1フレーム遅れる。**
> callback は次フレームに回るので、状態変数は callback の外で**同期に**確定させること。
> でないと連打したとき2回目が古い値から計算して巻き戻る。

> **切り替えを island にしない。**
> HonoX（honox 0.1.x）は**1ページにつき最初の island しか `<honox-island>` で包まない**。
> ヘッダーの切り替えを island にすると常にそれが「最初」になり、`/about` の
> `TechStackTag` などが巻き添えで死ぬ。ハンバーガー内に置いたもう一つの切り替えも、
> 2つ目なのでハイドレートされない。
>
> ```
> $ grep -o '<honox-island' dist/about.html | wc -l
> 1                      # TechStackTag は16個描画されているが、包まれるのは1つだけ
> ```
>
> `document` でクリックを委譲すれば、ハイドレーションに一切依存せず全部が動く。

> **選択中の「見た目」をサーバでも JS の状態でも描かない。**
> サーバは閲覧者の選択を知り得ない。どのセグメントが光るかは `:root[data-theme]` から
> CSS で引く。そうすれば初回描画の時点で既に正しい
> （`aria-checked` と `tabindex` は CSS から書けないのでスクリプトが付ける）。
>
> ```css
> :root:not([data-theme]) [data-theme-option="system"],
> :root[data-theme="light"] [data-theme-option="light"],
> :root[data-theme="dark"]  [data-theme-option="dark"] { /* 選択中 */ }
> ```
>
> ここで `prefers-color-scheme` を見てはいけない。システムが今どちらに解決されて
> いようと、選択されているのは「システム」というセグメントだから。

> **`ThemeToggle` 側で `background-color` / `color` を宣言しない。**
> `hono/css` は**非レイヤー**で注入され、特異度に関係なくレイヤー付きの指定に**常に勝つ**。
> `components.css` は `@layer components` の中にあるので、ボタン側が色を宣言した瞬間に
> 上の出し分けが効かなくなり、**選択中のセグメントが光らなくなる**。
>
> ```
> dist/static/index-*.css   @layer tokens / base / components / utilities
> dist/index.html           @layer の出現回数: 0     ← hono/css はここ
> ```
>
> エラーも警告も出ず、ただ光らなくなるだけなので気づきにくい。ホバーの背景を
> 足したくなったときが危ない。色は `components.css` に置く。
> `transition` に `background-color` を並べるのは問題ない（値を決めていないため）。

JS を切っている閲覧者はテーマを選べず、①（システム設定に従う）で固定される。個人ブログとして許容している。

---

## Foundation — 地・面・インク・影の4層

配色はすべてこの4層から引く。

| トークン | 役割 | 制約 |
|---|---|---|
| `--ground` | 地。ページ全体の背景 | — |
| `--surface` | 面。カードなど | **常に地より明るい** |
| `--ink` | 本文のインク | 純黒にせず微かに青紫を帯びさせる |
| `--ink-muted` | 補助的な文字 | 地・面の両方に 4.5:1 |
| `--edge` | モノの輪郭 | 全周均一。面に 3:1 |
| `--rule` | 区切り線 | `--edge` より弱く引く |
| `--shadow` | 影 | **常に地より暗い** |
| `--accent` / `--on-accent` | アクセント（ライム） | テーマで反転させない |
| `--inverse` / `--on-inverse` | 反転面（ツールチップ） | ライムは乗らない |
| `--link` | 本文中のリンク | 地・面の両方に 4.5:1 |

### 貫いている原理

> **塗りが地に沈むなら、輪郭が形を定義する。**

ライムは白地に対して 1.18 しかない。**面として使うか、輪郭を回すか**のどちらかが必須で、線・下線・縁取りに単独で使うと消える。

影は「版ズレ」ではなく「影」として扱う。見た目は同じでも意味が正反対で、**影は必ず地より暗い**（テーマで反転させてはいけない）。

### 一つの要素に二つの仕事をさせない

カードの枠は全周均一にして輪郭の定義だけを担わせ、立体は面の明度差と影に任せる。リムライト（上/左だけ明るく）は枠が立体も担う二重構造になるため使わない。

---

## Component トークン

Foundation を参照し、特定の UI に割り当てる。**Primitive を直接参照しない。**

```css
--color-card-background: var(--surface);
--color-card-border: var(--edge);
--color-card-shadow: var(--shadow);
--color-header-background: light-dark(var(--inverse), oklch(0.39 0.014 285));
--color-tag-foreground: var(--on-accent);
```

既存のセマンティックトークン（`--color-primary` など）も Foundation へのエイリアスになっている。呼び名は保ったまま配色だけ差し替えられる。

> **`.tsx` から Primitive（`--color-neutral-*` など）を直接参照しない。**
> 地や面の値を動かしたときに追従せず、静かにズレる。検証スクリプトはトークン同士の
> 組み合わせしか見ないので、ここだけは機械的に検出できない。
>
> ```
> grep -rn 'var(--color-neutral-\|var(--color-lime-\|var(--color-violet-' app --include='*.tsx'
> ```

### ツールチップは反転面に置く

一時的に浮く要素（ツールチップ）は `--inverse` / `--on-inverse` を使う。両テーマで地から 12:1 以上離れるので、出た瞬間に読み取れる。

ライムは反転面のダーク側（0.95）に対して 1.13 しかないので、反転面の上には置けない。

### ヘッダーは常時表示なので反転させない

ライトは反転面（地に対して 16.39）。**ダークは反転させない。** 反転すると地に対して 12.21 になり、
ダークテーマなのに常時表示のヘッダーだけが画面で一番強い面になってしまう。

代わりに明度の段で浮かせる。

```
地 0.29  <  カード面 0.345  <  ヘッダー 0.39
```

塗りの差は小さい（1.47）が、輪郭が地に対して 3.87 で形を定義する。

---

## 検証

```
aube run check           # 型 + コントラスト + テーマ切り替え
aube run check:contrast  # コントラストのみ
aube run check:theme     # テーマ切り替えのみ
```

`scripts/check-contrast.mjs` は **`app/styles/` に実際に書かれた値を読んで** OKLCH → OKLab → linear sRGB → 相対輝度 → WCAG 2.x の比を計算する。ハードコードした色ではないので、トークンを書き換えれば結果もそのまま追従する。

検証している内容：

- 本文・補助文字・リンクが両テーマで **4.5:1**（WCAG 1.4.3）
- 輪郭が両テーマで **3:1**（WCAG 1.4.11）
- 面が地より明るい / 影が地より暗い

`scripts/theme.check.mjs` は3状態が `data-theme` へどう写るかを検証する。

> **ロジックの複製をテストしても、そのロジックが呼ばれるかは検証できない。**
> 前身の `theme-route.check.mjs` は `app/routes/theme.ts` の中身を別ファイルへ
> コピーして検証していた。ハンドラは正しかったので検査は緑のままだったが、
> Workers Assets に先取りされてそのハンドラは一度も呼ばれていなかった。
>
> だから現在の検査はロジックを複製せず、`<head>` に入る実物のスクリプトを
> 偽の DOM 上で実行し、さらに「`_renderer.tsx` が実際にそれを出力しているか」
> 「cookie 方式の残骸が `app/` に無いか」まで見る。
>
> **同じ理由で、スクリプトの写像を TypeScript 側に持たせない。**
> 検査のためだけの `themeAttribute()` のような関数は、本番で一度も実行されない
> 複製そのものになる。

> **暗い側では、暗くしても直らない。**
> コントラスト比は `(明るい方の輝度 + 0.05) / (暗い方の輝度 + 0.05)`。この `+0.05` は分母が小さいときに支配的になるため、暗い側では輝度差が比に反映されない。影を 0.09 から 0.05 に落としても 1.17 → 1.18 でしか動かない。**対処は「暗くする」ではなく「地を上げて余地を作る」。**

---

## その他のトークン

### スペーシング

```css
--spacing-xs: var(--size-100);   /* 4px */
--spacing-sm: var(--size-200);   /* 8px */
--spacing-md: var(--size-400);   /* 16px */
--spacing-lg: var(--size-600);   /* 24px */
--spacing-xl: var(--size-800);   /* 32px */
--spacing-2xl: var(--size-1000); /* 40px */
```

### テキスト

```css
--text-heading-xl/lg/md/sm  /* 見出し */
--text-hero                 /* ヒーロー見出し */
--text-body/body-sm/body-lg /* 本文 */
--text-base                 /* 記事の説明文（本文より一段大きい） */
--text-code                 /* コードブロック */
```

### ブレークポイント

```css
--window-xs: 320px;  --window-sm: 480px;  --window-md: 768px;
--window-lg: 1024px; --window-xl: 1280px; --window-2xl: 1536px;
```
