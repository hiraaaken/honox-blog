import { css } from 'hono/css'

export type BreadcrumbItem = {
  label: string
  href?: string // hrefがない場合は現在ページ（最後の項目）
}

type Props = {
  items: BreadcrumbItem[]
  baseUrl?: string // 構造化データ用のベースURL
}

const breadcrumbNav = css`
  padding: 1rem 0 1.5rem;
  font-size: 0.875rem;
  color: var(--color-text-secondary);

  @container (max-width: 800px) {
    padding: 0.75rem 0 1rem;
    font-size: 0.8125rem;
  }
`

const breadcrumbList = css`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  list-style: none;
  margin: 0;
  padding: 0;
`

const breadcrumbItem = css`
  display: flex;
  align-items: center;

  &:not(:last-child)::after {
    content: '>';
    margin-left: 0.5rem;
    color: var(--color-text-tertiary);
    font-weight: 400;
  }
`

const breadcrumbLink = css`
  color: var(--color-text-secondary);
  text-decoration: none;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.2s ease;

  @media (hover: hover) {
    &:hover {
      color: var(--color-primary, #0066cc);
      text-decoration: underline;
    }
  }

  &:focus-visible {
    outline: 2px solid var(--color-primary, #0066cc);
    outline-offset: 2px;
    border-radius: 2px;
  }

  @container (min-width: 800px) {
    max-width: 300px;
  }
`

const breadcrumbCurrent = css`
  color: var(--color-text-primary);
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  @container (min-width: 800px) {
    max-width: 400px;
  }
`

export const Breadcrumb = ({ items, baseUrl }: Props) => {
  // 構造化データ（JSON-LD）の生成
  const structuredData = baseUrl
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: item.label,
          ...(item.href && { item: `${baseUrl}${item.href}` }),
        })),
      }
    : null

  return (
    <>
      <nav aria-label="breadcrumb" class={breadcrumbNav}>
        <ol class={breadcrumbList}>
          {items.map((item, index) => {
            const isLast = index === items.length - 1

            return (
              <li key={index} class={breadcrumbItem}>
                {item.href ? (
                  <a href={item.href} class={breadcrumbLink}>
                    {item.label}
                  </a>
                ) : (
                  <span class={breadcrumbCurrent} aria-current="page">
                    {item.label}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      )}
    </>
  )
}
