interface UpdateUrlParamsFilterEvent {
  type: "updateUrlParamsFilter";
  params?: string[];
}

export const updateUrlParamsFilter = (
  emittedEvent: UpdateUrlParamsFilterEvent
) => {
  const { params } = emittedEvent;
  console.log({ params });
  if (!params) {
    return;
  }
  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete("filter");
  params.forEach((filter) => {
    newUrl.searchParams.append("filter", filter);
  });
  window.history.replaceState({}, "", newUrl.toString());
};

interface UpdateUrlParamsQEvent {
  type: "updateUrlParamsQ";
  q?: string;
}

export const updateUrlParamsQ = (emittedEvent: UpdateUrlParamsQEvent) => {
  const { q } = emittedEvent;

  const newUrl = new URL(window.location.href);
  newUrl.searchParams.delete("q");
  if (q) {
    newUrl.searchParams.append("q", q);
  }
  window.history.replaceState({}, "", newUrl.toString());
};

export const getInitialUrlParams = (
  knownFilters: readonly { readonly id: string; readonly label: string }[]
) => {
  const filter = new URLSearchParams(document.location.search);
  const filters = filter
    .getAll("filter")
    .filter((filter) => knownFilters.find((known) => known.id === filter));
  const q = filter.get("q") ?? "";
  return { filters, q };
};
