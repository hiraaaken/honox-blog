import { jsxRenderer } from "hono/jsx-renderer";
import { getCookie } from "hono/cookie";
import { Link, Script } from "honox/server";
import { Header } from "../components/Header";
import { css, Style } from "hono/css";
import {
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  resolveOgImage,
} from "@/lib/site";

const mainClass = css`
  display: grid;
  container-type: inline-size;
  gap: var(--spacing-lg);
`;

const footerClass = css`
  text-align: center;
  border-top: 2px solid var(--color-border);
  padding: var(--spacing-base);
  margin-top: auto;
  font-size: var(--text-body-sm);
  color: var(--color-muted);
`;

export default jsxRenderer(
  (
    { children, title, description, path, type, image, publishedAt, updatedAt },
    c,
  ) => {
    const currentTheme = (getCookie(c, "theme") || "light") as "light" | "dark";
    const currentPath = c.req.path;

    const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const canonicalUrl = absoluteUrl(c, path || currentPath);
    const ogType = type || "website";
    const ogImage = resolveOgImage(c, image);

    return (
      <html
        lang="ja"
        class={currentTheme === "dark" ? "dark" : ""}
        data-theme={currentTheme}
      >
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <link rel="icon" href="/icon.png" type="image/png" />
          <title>{pageTitle}</title>
          <meta name="description" content={pageDescription} />
          <link rel="canonical" href={canonicalUrl} />

          <meta property="og:site_name" content={SITE_NAME} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={pageDescription} />
          <meta property="og:type" content={ogType} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:image" content={ogImage} />
          <meta property="og:locale" content="ja_JP" />
          {publishedAt && (
            <meta property="article:published_time" content={publishedAt} />
          )}
          {updatedAt && (
            <meta property="article:modified_time" content={updatedAt} />
          )}

          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={pageDescription} />
          <meta name="twitter:image" content={ogImage} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
            (function() {
              const savedTheme = document.cookie
                .split('; ')
                .find(row => row.startsWith('theme='))
                ?.split('=')[1];
              const theme = savedTheme || 'light';
              document.documentElement.dataset.theme = theme;
              document.documentElement.className = theme === 'dark' ? 'dark' : '';
            })();
          `,
            }}
          />
          <Link href="/app/styles/index.css" rel="stylesheet" />
          <Script src="/app/client.ts" async />
          <Style />
        </head>
        <body>
          <Header initialTheme={currentTheme} currentPath={currentPath} />

          <main class={mainClass}>{children}</main>

          <footer class={footerClass}>
            <p>&copy; {new Date().getFullYear()} hiraaaken All rights reserved.</p>
          </footer>
        </body>
      </html>
    );
  },
);
