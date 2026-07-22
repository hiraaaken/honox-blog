import type { NotFoundHandler } from 'hono'

const handler: NotFoundHandler = (c) => {
  c.status(404)
  return c.render('404 Not Found', { title: 'ページが見つかりません' })
}

export default handler
