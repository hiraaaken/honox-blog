type FormatDate = (iso: string) => string;
type FormatUpdatedDate = (updated: string, published: string) => string;

// 実行環境のタイムゾーン（Workers と CI は UTC、手元は JST）に表示を左右させない
const TIME_ZONE = "Asia/Tokyo";

const fullFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "long",
  day: "numeric",
});

const monthDayFormat = new Intl.DateTimeFormat("ja-JP", {
  timeZone: TIME_ZONE,
  month: "long",
  day: "numeric",
});

const yearFormat = new Intl.DateTimeFormat("en-US", { timeZone: TIME_ZONE, year: "numeric" });

export const formatDate: FormatDate = (iso) => fullFormat.format(new Date(iso));

export const formatUpdatedDate: FormatUpdatedDate = (updated, published) =>
  yearFormat.format(new Date(updated)) === yearFormat.format(new Date(published))
    ? monthDayFormat.format(new Date(updated))
    : formatDate(updated);
