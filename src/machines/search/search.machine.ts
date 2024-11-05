import { assign, fromPromise, setup } from "xstate";

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
    toggleFilterInContext: assign({
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
    assignQToContext: assign({
      currentQ: ({ event }) => event.q,
    }),
    resetFiltersIfNoQ: assign({
      selectedFilters: ({ context }) => {
        if (!context.currentQ) {
          return [];
        }
        return context.selectedFilters;
      },
    }),
    resetFilters: assign(() => ({
      selectedFilters: [],
    })),
    setFacetDataInContext: assign({
      facetData: ({ event }) => event.data,
    }),
    setSearchDataInContext: assign({
      facetData: ({ event }) => event.data,
    }),
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
    contextHasSearchString: ({ context }) => {
      return Boolean(context.currentQ && context.currentQ.length > 0);
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAKgPIDi1AMgKID6AYgJJ3kMBKA2gAwBdRKAAOAe1j4ALvnEA7ESAAeiAEwAWNbgAc-NQDYA7Gv56ArKYCc5gDQgAnog38DuK2oDM3ozoCM5kYaOgYAvqH2KBg4BMRkVLSMrBxcfH7CSCASUrIKSqoIhua4fmqmOkaeRn4aGkH2Tgjm5m46-lYmalZV5lY64ZFoWHiEJBQAmgAKbABy1AIZYpIycoqZBQC0LTolfp46pr2eBhpWDYhBnrj8fvy1nmXBVgMgUcOxYwDKDACC3ADCAAkFkpsis8ut1EZ+LgNOYdB4DB5zHVfOcEAYKrCkScjJi7p4US83jFRmRvn8gbx0qDlrk1qACl1tEZfJ4-NU7gZ9EZ0Qc-Lh9p4NPsNLcDGodOZiUMYgAzfBEaRgdD4eRQH7yCCfWXYNVQUgQBRgXCwaSoZWm3W4BVKlX6zXa3X6kGZMH0-KIDaGNx3FFGXoGdlGPro25XfiuNTmVyWQzeMIRV7W23K1Xqx066J69VW7N54b6w3GgjyABu4gA1iaSXhU-aM1qs4Xc7WCzh9Qg1RXMBbVgtXUscqtPQhbi13FZud0A+jNDtkb5StKk236+mNU3na3rbWiyr0OJ0LhREQLXKjwBbdt1xVph1b7P6m83zvd8S9+kDoS04cQxmIDodS4NUFTCkEpS3GcjiIH4VgaO4+jCj0Mr5uuD5Ok+ubrjad4NgaRryCa77Vi+6GNphLZQLhdrHuRUBduWH59go36LFkdIjpCY76G4WiBP40booEMIIlGK6DGheEbpm27UTh9GkAeR4nme0gXug15rtJGHNh22HSTR97qoxPYsfIbG-uCDIqIBwFii4Ep2DBTR+K0xh+BUK5JvI4gQHASi1lZHrcRsBhubs+yHN0JzQY0YVGLgvSsscgaVA5qHvGSwVcQBCAbDUVggSELhwvCBjmKUGjouFxQmE8lRqEEVh+H4mXyjpFF6TmUA5f+tkIJUiVeFyXlhkVVhIV4BjGC1hgaO1t60bpck3n1NkFL4xTmISAROWG-CJS4Xg6J43TRr0WiLUZ+GyVh1Ftnu6rraOp1XDtlUtEJLmaEdSEigG130XdVEvoRYAvdxpS+CBQqtXiAZLnOSK4BVXgAxJyZSctXWreukN5VtuAjRomKzi5WhFccnR4gczQ2EDnWbpR+nyYZ9EEwNb3E54o3k40LRUx5XmMzjzPdc+OHg5zBRVTC8J9EEhiI-4wktajHKeYD4ShEAA */
  id: "search",
  initial: "filteringAndSearching",
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
        TOGGLE_FILTER: [
          {
            guard: "contextHasSearchString",
            actions: ["toggleFilterInContext"],
            target: "filteringAndSearching",
          },
          {
            target: "idle",
          },
        ],
        TYPING: {
          actions: ["assignQToContext"],
        },
        SEARCH: [
          {
            guard: "contextHasSearchString",
            actions: ["resetFilters"],
            target: "filteringAndSearching",
          },
          {
            actions: ["resetFilters"],
            target: "idle",
          },
        ],
      },
    },
    filteringAndSearching: {
      type: "parallel",
      initial: "search",
      states: {
        search: {
          initial: "searching",
          states: {
            searching: {
              invoke: {
                src: "performSearch",
                input: ({ context }) => ({
                  q: context.currentQ,
                  filters: context.selectedFilters,
                }),
                onDone: {
                  actions: ["setSearchDataInContext"],
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
          states: {
            filtering: {
              invoke: {
                src: "getFacets",
                input: ({ context }) => ({
                  q: context.currentQ,
                  filters: context.selectedFilters,
                }),
                onDone: {
                  actions: ["setFacetDataInContext"],
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
  },
});
