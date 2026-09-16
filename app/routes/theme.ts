import { setCookie } from "hono/cookie"
import { createRoute } from "honox/factory"

/**
 * 切り替え先はフォームから受け取る。cookie を反転させる方式だと、cookie が
 * 無い状態で必ず dark になり、既に OS がダークの人には何も起きないように見える。
 */
export const POST = createRoute(async (c) => {
  const body = await c.req.parseBody();
  const next = body["to"] === "light" ? "light" : "dark";

  setCookie(c, "theme", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "Lax",
  });

  const referer = c.req.header("Referer");
  const refererUrl = referer && URL.canParse(referer) ? new URL(referer) : null;
  const back = refererUrl && refererUrl.origin === new URL(c.req.url).origin ? refererUrl.pathname : "/";
  return c.redirect(back, 303);
});
