import { and, assign, createActor, emit, fromPromise, setup } from "xstate";

export default setup({
  types: {
    context: {} as {
      currentQ: string;
      searchData: Record<string, unknown>;
      facetData: Record<string, unknown>;
      selectedFilters: string[];
      knownFilters: readonly { readonly id: string; readonly label: string }[];
    },
    input: {} as {
      q: string;
      filters: string[];
      knownFilters: readonly { readonly id: string; readonly label: string }[];
    },
  },
  actions: {
    updateUrlParamsQ: emit(({ context }) => ({
      type: "updateUrlParamsQ",
      q: context.currentQ,
    })),
    updateUrlParamsFilter: emit(({ context }) => ({
      type: "updateUrlParamsFilter",
      params: context.selectedFilters,
    })),
  },
  actors: {
    performSearch: fromPromise(
      async ({ input }: { input: { q: string; filters: string[] } }) => {
        return fetch(`http://localhost:3005/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input }),
        }).then((res) => res.json());
      }
    ),
    getFacets: fromPromise(
      async ({ input }: { input: { q: string; filters: string[] } }) => {
        return fetch(`http://localhost:3005/facets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input }),
        }).then((res) => res.json());
      }
    ),
  },
  guards: {
    hasSearchString: ({ context }) => {
      return Boolean(context.currentQ && context.currentQ.length > 0);
    },
    hasFilters: ({ context }) => {
      return Boolean(
        context.selectedFilters && context.selectedFilters.length > 0
      );
    },
    filterNotAlreadySelected: ({ context, event }) => {
      return !context.selectedFilters.includes(event.filter);
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAKgPIDi1AMgKID6AYgJJ3kMBKA2gAwBdRKAAOAe1j4ALvnEA7ESAAeiAMxqALLgCsagBwBOQ0bU6AjAHZ+5gDQgAnok2GAbLs399ln+deXNS30AX2D7FAwcAmIycgBNAAU2ADlqAWEkEAkpWQUlVQQAWjVXbU0AJktzcvM1cv01fn41eycEHX19XC1yrTVzQwHLHUNQ8LQsPEISUgBlBgBBbgBhAAl0pWyZOUVMgsLzcx1cZrVDNQD6vwaWx0Rz3EsDJv5h1xGdUrGQCMncADN8ERpGB0Ph5FBSBAFGBcLBpKgQXCJlFAcDQeCoBtMltcrtQAUju5-IYnq5XGdzuTXK1EAFLI9yqVyq8NIYRmpvr9UUCQWCIcjInhudhMVCYQR5AA3cQAa1hIoBvIxAsVIsxCHBMswiJ26WxYkk2zye0Q5n4rkMuEMLMG+h0TU05gatIQ-jUuApFPO-FJHVJXJReDRfMxgr+6ohpFB6HE6FwoiIiP+cYAtuGeej+VAM8KgxqteIdXj9UJNka8flEPpXPxPZozJa-PVNK3Xa4Bp7qiZ3pp9OZAjpA0KlVmwyHQaPQ1HofJYYX5bmpyqcxP42uC9Ki7qFKWMoacjsqwhzZ4TgEbbWntVNDpXaT3N4BzWbkdW8O-huBWvl9no+hY3jRNkzTJcv1XZV10gzdtR3eQ93LQ8TQJasOxOCkam8fwjCse9ynKXB9D7ZoKS0e1mg-KJIxzajxTnSUZUXNV81VFioE1Ldiz1IQDSyCsj1Ndpalwa4agMG8bX0V0Li6HRKndIILmGYZKLzIUw1omM4wTJNpBTdB02Y9TWOM9jCy43ceLLHF+OQlRnCeXQtDcS19CacoKldA5LCtfgmRtQ5KnqfQmVCMIQHkcQIDgJQRUQ418XsoonQIioqjE+pGmaLyzG0Pym1bdlmlvTlwsVaYwHiytBMKB4Bn4B0POdJkguk-htEGAwa2qYYdDk1Tf0xKqBJQhBhjrW9jEtTwmXtKS7gQVttA7cp2Qqeo-POSwBvA3NhrsgofK6Sa3EMGbXDm109AIwKztbAYiItHboJMiM2P2xKCiI9wTum-LLoW-wbu7bwXBeEIyqDQbXqiWdKpspDPrNSpzG6B0Rhayk-PbM7ulcVa2SsYxzmesdv0gj7jyOwifPx28bC0OwFoaY4yPajsG2aQZSenCCs2hqBKcE76abcDyHVqJ172GbpiP7fC+qeHmV1-XA4aF0bqkOXBeiMOT-FePt71JXQTFePw-IqVwBuojWkqdVGzFqM6Lp89rNC8pl3H1wZanq4x30hkdqNzIaEYS49JrR53NFdwx3a86pvf80pJfqNxtrCoA */
  id: "search",
  initial: "idle",
  context: ({ input }) => ({
    currentQ: input.q ?? "",
    searchData: {},
    facetData: {},
    selectedFilters: input.filters ?? [],
    knownFilters: input.knownFilters,
  }),
  states: {
    idle: {
      on: {
        TOGGLE_FILTER: {
          // guard: "hasSearchString",
          actions: [
            assign({
              selectedFilters: ({ event, context }) => {
                // Remove filter.
                if (context.selectedFilters.includes(event.filter)) {
                  return context.selectedFilters.filter(
                    (filter) => filter !== event.filter
                  );
                }
                // Add filter.
                return [...context.selectedFilters, event.filter];
              },
            }),
            { type: "updateUrlParamsFilter" },
          ],
          target: "filtering",
        },
        TYPING: {
          actions: [
            assign({
              currentQ: ({ event }) => {
                return event.q;
              },
              selectedFilters: ({ context }) => {
                if (!context.currentQ) {
                  return [];
                }
                return context.selectedFilters;
              },
            }),
          ],
        },
        SEARCH: {
          actions: [
            assign(() => ({
              selectedFilters: [],
            })),
            { type: "updateUrlParamsQ" },
          ],
          target: "searching",
        },
      },
    },
    filtering: {
      type: "parallel",
      initial: "search",
      states: {
        search: {
          initial: "searching",
          guard: "hasSearchString",
          states: {
            searching: {
              invoke: {
                src: "performSearch",
                input: ({ context }) => {
                  return {
                    q: context.currentQ,
                    filters: context.selectedFilters,
                  };
                },
                onDone: {
                  actions: assign({
                    searchData: ({ event }) => event.output,
                  }),
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
        filter: {
          initial: "filtering",
          guard: and(["hasSearchString", "hasFilters"]),
          states: {
            filtering: {
              invoke: {
                src: "getFacets",
                input: ({ context }) => {
                  return {
                    q: context.currentQ,
                    filters: context.selectedFilters,
                  };
                },
                onDone: {
                  actions: assign({
                    facetData: ({ event }) => event.output,
                  }),
                  target: "done",
                },
                onError: {},
              },
            },
            done: {
              type: "final",
            },
          },
        },
      },
      onDone: {
        target: "#search.idle",
      },
    },
    searching: {
      initial: "searching",
      guard: ["hasSearchString"],
      states: {
        searching: {
          invoke: {
            src: "performSearch",
            input: ({ context }) => {
              return {
                q: context.currentQ,
                filters: context.selectedFilters,
              };
            },
            onDone: {
              actions: assign({
                searchData: ({ event }) => event.output,
              }),
              target: "#search.idle",
            },
            onError: {},
          },
        },
      },
    },
  },
});
