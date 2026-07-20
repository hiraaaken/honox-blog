import { getCookie, setCookie } from "hono/cookie"
import { createRoute } from "honox/factory"

export const POST = createRoute((c) => {
  const next = getCookie(c, "theme") === "dark" ? "light" : "dark";
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

