import { jsxRenderer } from "hono/jsx-renderer";
import { getCookie } from "hono/cookie";
import { Link, Script } from "honox/server";
import { Header } from "../islands/Header";
import { css, Style } from "hono/css";

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

export default jsxRenderer(({ children }, c) => {
  const currentTheme = (getCookie(c, "theme") || "light") as "light" | "dark";
  const currentPath = c.req.path;

  return (
    <html
      lang="ja"
      class={currentTheme === "dark" ? "dark" : ""}
      data-theme={currentTheme}
    >
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
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
        <Link href="/app/base-styles.css" rel="stylesheet" />
        <Script src="/app/client.ts" async />
        <Style />
      </head>
      <body>
        <Header initialTheme={currentTheme} currentPath={currentPath} />

        <main class={mainClass}>{children}</main>

        <footer class={footerClass}>
          <p>&copy; 2025 hiraaaken All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
});
