import type { } from 'hono'
import { Meta } from './types'

declare module 'hono' {
  interface ContextRenderer {
    (
      content: string | Promise<string>,
      meta?: Meta & { frontmatter: Meta }
    ): Response | Promise<Response>
  }
}
