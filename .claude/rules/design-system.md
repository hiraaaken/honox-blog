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
| `app/lib/theme.ts` | 3状態の定義、`data-theme` への写像、`<head>` に入る初期化スクリプト |
| `app/components/ThemeToggle.tsx` | 3分割セグメント。マークアップだけを持つ |
| `components.css` | どのセグメントが選択中かの出し分け |

`_renderer.tsx` は `<head>` に**同期スクリプトを1つ**置く。役割は3つ。

1. 描画前に `data-theme` を確定させる（`client.ts` は `async` で読まれるのでハイドレーション後では間に合わない）
2. `[data-theme-option]` のクリックを `document` で委譲して受ける
3. `aria-pressed` を選択状態に合わせる

切り替えにサーバ往復は無い＝**画面は再読み込みされない**。

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

> **選択状態をサーバでも JS の状態でも描かない。**
> サーバは閲覧者の選択を知り得ない。どのセグメントが光るかは `:root[data-theme]` から
> CSS で引く。そうすれば初回描画の時点で既に正しい。
>
> ```css
> :root:not([data-theme]) [data-theme-option="system"],
> :root[data-theme="light"] [data-theme-option="light"],
> :root[data-theme="dark"]  [data-theme-option="dark"] { /* 選択中 */ }
> ```
>
> ここで `prefers-color-scheme` を見てはいけない。システムが今どちらに解決されて
> いようと、選択されているのは「システム」というセグメントだから。

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
> だから現在の検査は `app/lib/theme.ts` を**複製せず import** し、`<head>` に
> 入る実物のスクリプトを偽の DOM 上で実行し、さらに「`_renderer.tsx` が実際に
> それを出力しているか」「cookie 方式の残骸が `app/` に無いか」まで見る。

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
