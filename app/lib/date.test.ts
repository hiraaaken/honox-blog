import { describe, expect, test } from "vite-plus/test";
import { formatDate, formatUpdatedDate } from "./date";

describe("formatDate", () => {
  test("年月日を日本語で出す", () => {
    expect(formatDate("2026-07-22")).toBe("2026年7月22日");
  });

  // Workers と CI は UTC で動く。UTC の 12/31 16:00 は日本時間で元日
  test("日本時間で日付を決める", () => {
    expect(formatDate("2026-12-31T16:00:00Z")).toBe("2027年1月1日");
  });
});

describe("formatUpdatedDate", () => {
  test("公開と同じ年なら年を省く", () => {
    expect(formatUpdatedDate("2026-11-16", "2026-07-22")).toBe("11月16日");
  });

  test("年が違えば年から出す", () => {
    expect(formatUpdatedDate("2027-01-05", "2026-07-22")).toBe("2027年1月5日");
  });

  test("年の比較も日本時間で行う", () => {
    // UTC では 2026 年同士だが、更新日は日本時間で 2027 年
    expect(formatUpdatedDate("2026-12-31T16:00:00Z", "2026-07-22")).toBe("2027年1月1日");
  });
});
