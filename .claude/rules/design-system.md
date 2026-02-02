# デザインシステム

## CSS Custom Properties 3層構造

`app/base-styles.css`で管理

### Layer 1: Primitive Tokens（基本値）

生のデザイン値。直接参照せず、Semantic層を経由することを推奨。

```css
--color-neutral-50: oklch(0.985 0 0);
--size-400: 1rem;
--window-md: 768px;
```

### Layer 2: Semantic Tokens（意味的な用途）

Primitive Tokensを参照し、用途を明示。

```css
--color-primary: var(--color-lime-300);
--spacing-md: var(--size-400);
--text-body: var(--text-md);
--shadow-md: 0 3.5px 7px var(--color-shadow-dark);
```

### Layer 3: Component Tokens（コンポーネント固有）

Semantic Tokensを参照し、特定のUIコンポーネントに適用。

```css
--card-bg: light-dark(var(--color-neutral-100), var(--color-neutral-750));
--card-border: var(--border-width-thick) solid var(--color-card-border);
--card-shadow: 0 2px 0 var(--color-card-shadow);
```

## トークン一覧

### ブレークポイント

```css
--window-xs: 320px;
--window-sm: 480px;
--window-md: 768px;
--window-lg: 1024px;
--window-xl: 1280px;
--window-2xl: 1536px;
```

### スペーシング

```css
--spacing-xs: var(--size-100);   /* 4px */
--spacing-sm: var(--size-200);   /* 8px */
--spacing-md: var(--size-400);   /* 16px */
--spacing-lg: var(--size-600);   /* 24px */
--spacing-xl: var(--size-800);   /* 32px */
--spacing-2xl: var(--size-1000); /* 40px */
```

### シャドウ

```css
--shadow-sm: 0 1px 2px var(--color-shadow-dark);
--shadow-md: 0 3.5px 7px var(--color-shadow-dark);
--shadow-lg: 0 10px 25px var(--color-shadow-dark);
--shadow-xl: 0 20px 40px var(--color-shadow-dark);
```

### テキスト

```css
--text-heading-xl/lg/md/sm  /* 見出し */
--text-hero                 /* ヒーロー見出し */
--text-body/body-sm/body-lg /* 本文 */
--text-code                 /* コードブロック */
--text-button               /* ボタンテキスト */
--text-caption              /* キャプション */
```

## テーマ対応

`light-dark()` CSS関数で自動的にライト/ダークモード切り替え。

```css
color: light-dark(var(--color-neutral-800), var(--color-neutral-200));
```

テーマは`<html data-theme="light|dark">`で制御。
