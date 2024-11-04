import { assign, fromPromise, setup } from "xstate";

export default setup({
  actors: {
    performSearch: fromPromise(async ({ input }: { input: { q: string } }) => {
      console.log("Searching for:", input.q);

      return fetch(`http://localhost:3005/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input.q }),
      });
    }),
    getFacets: fromPromise(
      async ({ input }: { input: { filters: Record<string, string[]> } }) => {
        console.log("Filtering", input.filters);

        return fetch(`http://localhost:3005/facets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query: input.filters }),
        });
      }
    ),
  },
}).createMachine({
  id: "search",
  initial: "idle",
  states: {
    idle: {
      on: {
        FILTER: "filtering",
        SEARCH: "searching",
      },
    },
    filtering: {
      states: {
        search: {
          invoke: {
            src: "performSearch",
            input: ({ event }) => ({
              q: event.q,
            }),
            target: "idle",
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
          },
        },
        filter: {
          guard: "hasFilters",
          invoke: {
            src: "getFacets",
            input: ({ event }) => ({
              filters: event.filters,
            }),
            target: "idle",
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
            onError: "failure",
          },
        },
        failure: {
          after: {
            1000: "search",
          },
        },
      },
      type: "parallel",
      onDone: {
        target: "idle",
      },
    },
    searching: {
      states: {
        search: {
          invoke: {
            src: "performSearch",
            input: ({ event }) => ({
              q: event.q,
            }),
            target: "idle",
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
          },
        },
        failure: {
          after: {
            1000: "search",
          },
        },
      },
    },
  },
  guards: {
    hasFilters: ({ context }) => {
      return context.filters.length > 0;
    },
  },
});
