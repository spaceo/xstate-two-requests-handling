import { assign, fromPromise, setup } from "xstate";

export const machine = setup({
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
              target: "done",
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
          },
          done: {},
        },
        filter: {
          invoke: {
            src: "performFiltering",
            input: ({ event }) => ({
              q: event.q,
            }),
            onDone: {
              target: "done",
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
          },
          done: {},
        },
      },
      type: "parallel",
      onDone: {
        target: "idle",
      },
    },
    makingCoffee: {},
  },
});
