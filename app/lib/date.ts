type FormatDate = (iso: string) => string;
type FormatUpdatedDate = (updated: string, published: string) => string;

export const formatDate: FormatDate = (iso) =>
  new Date(iso).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

export const formatUpdatedDate: FormatUpdatedDate = (updated, published) =>
  new Date(updated).getFullYear() === new Date(published).getFullYear()
    ? new Date(updated).toLocaleDateString("ja-JP", {
        month: "long",
        day: "numeric",
      })
    : formatDate(updated);
