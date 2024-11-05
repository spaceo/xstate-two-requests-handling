export const getInitialUrlParams = (
  knownFilters: readonly { readonly id: string; readonly label: string }[]
) => {
  const filter = new URLSearchParams(window.location.search);
  const filters = filter
    .getAll("filter")
    .filter((filter) => knownFilters.find((known) => known.id === filter));
  const q = filter.get("q") ?? "";
  return { filters, q };
};

export const updateUrlParams = ({
  q,
  filters,
}: {
  q: string;
  filters: string[];
}) => {
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete("q");
  newUrl.searchParams.delete("filter");
  if (q) {
    newUrl.searchParams.append("q", q);
  }
  filters.forEach((filter) => {
    newUrl.searchParams.append("filter", filter);
  });
  window.history.replaceState({}, "", newUrl.toString());
};
