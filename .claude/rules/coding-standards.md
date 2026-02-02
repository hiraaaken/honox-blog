---
paths: 
  - "app/**" 
---

# コーディング規約

## ルート作成

```tsx
import { createRoute } from 'honox/factory'

export default createRoute((c) => {
  return c.render(<Component />)
})
```

## スタイリング

### CSS-in-JS

```tsx
import { css } from 'hono/css'

const componentClass = css`
  /* light-dark()でテーマ対応 */
  color: light-dark(#333, #fff);
  background: light-dark(#fff, #1a1a1a);

  /* タッチデバイスでのホバー状態回避 */
  @media (hover: hover) {
    &:hover { opacity: 0.8; }
  }

  /* コンテナクエリでレスポンシブ対応 */
  @container (max-width: 800px) {
    font-size: 14px;
  }
`
```

### CSS Custom Properties

- 直接値のハードコードを避け、トークンを使用
- Primitive（`--size-*`, `--color-*-*`）は直接使わず、Semantic（`--spacing-*`, `--text-*`）を経由
- 新しいプロパティはbase-styles.cssの適切なレイヤーに追加

## コンポーネント配置

- **サーバーレンダリング専用**: `app/components/`
- **インタラクティブ（useState, useEffect使用）**: `app/islands/`
- ルート: `app/routes/`

## インポート

- `@/`エイリアスを活用（`app/`配下へのインポート）
- 例: `import { getPosts } from '@/lib/post'`

## JSX

- `hono/jsx`を使用（Reactではない）
- コンポーネント名はPascalCase
