/**
 * /theme の切り替えロジックを検証する。
 *
 *   node scripts/theme-route.check.mjs
 *
 * cookie を反転させる方式だと、cookie が無い（システム設定に従う）状態で
 * 必ず dark になり、既に OS がダークの人には何も起きないように見える。
 * フォームから切り替え先を明示的に受け取ることで3状態すべてで正しく動く。
 */

import { Hono } from "hono";
import { setCookie } from "hono/cookie";

// app/routes/theme.ts の POST ハンドラと同じロジック
const app = new Hono();
app.post("/theme", async (c) => {
  const body = await c.req.parseBody();
  const next = body["to"] === "light" ? "light" : "dark";
  setCookie(c, "theme", next, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "Lax",
  });
  const referer = c.req.header("Referer");
  const refererUrl = referer && URL.canParse(referer) ? new URL(referer) : null;
  const back =
    refererUrl && refererUrl.origin === new URL(c.req.url).origin
      ? refererUrl.pathname
      : "/";
  return c.redirect(back, 303);
});

const post = (to, referer = "http://localhost/posts") =>
  app.request("http://localhost/theme", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      ...(referer ? { Referer: referer } : {}),
    },
    body: to === null ? "" : `to=${to}`,
  });

const cases = [
  ["ライト表示から押す", "dark", "theme=dark", "/posts"],
  ["ダーク表示から押す", "light", "theme=light", "/posts"],
  ["値が無い場合の既定", null, "theme=dark", "/posts"],
];

let failed = 0;
console.log("\n  /theme の切り替え");
console.log("  " + "─".repeat(62));

for (const [label, to, wantCookie, wantPath] of cases) {
  const res = await post(to);
  const cookie = res.headers.get("set-cookie") ?? "";
  const loc = res.headers.get("location");
  const ok =
    cookie.includes(wantCookie) && res.status === 303 && loc === wantPath;
  if (!ok) failed++;
  console.log(
    `  ${ok ? "✓" : "✗"} ${label.padEnd(22)}` +
      `${res.status} → ${String(loc).padEnd(8)} ${cookie.split(";")[0]}`,
  );
}

// 別オリジンの Referer は無視してトップに戻す（オープンリダイレクト対策）
{
  const res = await post("dark", "http://evil.example/x");
  const ok = res.headers.get("location") === "/";
  if (!ok) failed++;
  console.log(
    `  ${ok ? "✓" : "✗"} ${"別オリジンの Referer".padEnd(22)}` +
      `${res.status} → ${res.headers.get("location")}`,
  );
}

console.log(
  failed === 0
    ? "\n  3状態すべてで切り替え先が意図どおり cookie に入る\n"
    : `\n  ${failed} 件が期待と異なる\n`,
);
process.exit(failed === 0 ? 0 : 1);
