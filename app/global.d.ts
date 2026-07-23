import type { } from 'hono'
import type { PageMeta } from './types'

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      meta?: PageMeta
    ): Response | Promise<Response>
  }
}

interface ImportMetaEnv {
  /** 本番URL（例: https://example.com）。未設定時はリクエストoriginにフォールバックする */
  readonly VITE_SITE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
