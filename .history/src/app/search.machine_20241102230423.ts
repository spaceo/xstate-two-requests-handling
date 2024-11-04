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
        SEARCH: "searching",
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
            onDone: {
              target: ".done",
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
          },
          done: {},
        },
        filter: {
          guard: "hasFilters",
          invoke: {
            src: "getFacets",
            input: ({ event }) => ({
              filters: event.filters,
            }),
            onDone: {
              target: "idle",
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
            onError: "failure",
          },
        },
        failure: {
          after: {
            1000: "filtering",
          },
        },
      },
      type: "parallel",
      onDone: {
        target: "idle",
      },
    },
  },
  guards: {
    hasFilters: ({ context }) => {
      return context.filters.length > 0;
    },
  },
});
