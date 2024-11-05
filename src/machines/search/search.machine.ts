import { and, assign, fromPromise, setup } from "xstate";

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
      currentQ: ({ event }) => {
        return event.q;
      },
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
    setFiltersInContext: assign({
      selectedFilters: ({ event }) => event.filters,
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
    hasSearchString: ({ context }) => {
      console.log(context.currentQ);
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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAKgPIDi1AMgKID6AYgJJ3kMBKA2gAwBdRKAAOAe1j4ALvnEA7ESAAeiAEwBGAGy4AzAHYAHAE5+WtQFYANCACeiACxHcxrQ7NqHx7z4sBfPxsUDBwCYjIAZQZyVg4ubgiBYSQQCSlZBSVVBE0dV35jA2s7RF0LBz0tfQ1DfQt+BsatAKC0LDxCEgoATQAFNgA5aiSlNJk5RRTsgFp6-RcNd3Ni+wRjNT19XQcixsa1FpBg9rCuqIBBbgBhAAkRlLGMydBsh01cDWMLXQ1LG1WtIZdLg1IC6odjqEAGb4IjSMDofDyKDneQQCJtHBIqCkCAKMC4WDSVDwwmYvAwuEI7Go9Hk7H3MSScaZKaIDQc3AOLQFIr-dmfFwWZZ7PYaCHk3CU+GI5G0jEhbDYsmKlXtbG4-EEeQAN3EAGsCZCKbCZTS0Qr1ci1aFjdiEEi9ZgSRMkozUsynll2fxhS58oU6vycg5DC5LEZfv5AkdJdLqXKLfTrcabUrkaQEehxOhcKIiCSoTmALZpqWmhMopOK5Wpu3Ih268TOp5uoSjT0Tb0IQxOXDVWrbfQOX4aArBz4VUxqbZFCWq+Oyqt0mvWxflqlLzXyAmOg1GuMVpfy5NQDcy8+VxtOl0KNvJJnpLtshBj0FciOGKPBiz6fi4EwPGjVoFyPc0VytM910XDUsxzPMC2kIt0FLVMYMTCCsTXI9LyXa9m1veR7w7J9WReRBe3mEclj+EoEAsbQAKqGpwUOeRxAgOAlGNEiWWeFREFmCwLAWGiVkEqpcAsYx9C0YVLHnE5OjAXivRfaZfjDAM+To8xgWqAdWJAk50OXS0sKgVTn3IhAtnmGd+G5WpxNfYwXH4GcdiM2NQM3cDzPTM8eIeTsyIE2zDBE74GPklyxyojzZ28tCwIwgLa0letLJC0j+OyIFgWijRYuDTwEs8ucYxSvy0tPMs8R3KywuyX5nC2IEOVkupI1KrQ3LkirksPGqzLqxcmryxAjBEhynKDOi3jc3RmOcxToVS0bVygnDTIm7sCpBXRHLBFzhSWlaht8s1aq23DcAalScr47tfncKSTFqN4ql-L8f2MDRcC0DRDOjAIgA */
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
        TOGGLE_FILTER: {
          actions: ["toggleFilterInContext"],
          target: "filteringAndSearching",
        },
        SET_FILTERS: {
          actions: ["setFiltersInContext"],
          target: "filteringAndSearching",
        },
        TYPING: {
          actions: ["assignQToContext"],
        },
        SEARCH: {
          actions: ["resetFilters"],
          target: "filteringAndSearching",
        },
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
                guard: and(["hasSearchString", "hasFilters"]),
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
