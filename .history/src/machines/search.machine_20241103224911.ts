import { assign, fromPromise, setup } from "xstate";

export default setup({
  actors: {
    performSearch: fromPromise(
      async ({
        input,
      }: {
        input: { q: string; filters?: Record<string, string[]> };
      }) => {
        return fetch(`http://localhost:3005/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ q: input.q }),
        });
      }
    ),
    getFacets: fromPromise(
      async ({
        input,
      }: {
        input: { q?: string; filters: Record<string, string[]> };
      }) => {
        // console.log("Facet input", input);

        return fetch(`http://localhost:3005/facets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ filters: input.filters.items }),
        });
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwA2GbgDsADgCcrOQCYArABoQAT0QBmVktxaALGttKrOuSqc6Avq4MoMOAsTIBlegBBRgBhAAk2TiQQPgFhMQlpBCstA2MEeS1cFRVWLRkTKxk1HTU5EyV3TzQsPAAzfCJBMHR8UShSCDEwXFhBVBa+2p9G5tb2qCiJOKERcRjk+UVVDW19I0RdNWUbOwcnF2qQLzrcMZa2juHvPFOcSa6eglEAN14Aa177hqbLyZuZx+kwQ7XemEG8yi0xiswSC1AyUcVlwahkVk0unSW3suB0WiKWjUKiUmlYOisVQ8JxGv3GVyggJ8wI6pFa6F46Fw3CIg3qnIAtky6f9rj9hSCwbwIfDoRwZvw5olFqYdDpcBU5KSimiCqw1FZsQgtFpWLg9rYCaS5OTKcdxRcJtdHVyXY9uqJelKvsLzn8nYyXX76ZK3tLIWI5dEeIr4UlEDoihqrCorJUNhlE9l8oTidbyW5qQ7-Qzg5cywG2egOVyeXzBb63c6SxWGaCwzKoRwYTH4vN4wgTGqNSYtTISRnEJSLLZZ1ayRSqdTRLwIHAJD8FX3lYjEABaORGvepe203wkLdKhFSRA23DohwmGRYzbGuQokyfz-mDSm8dWU9blbSZLzjFVjQcc1E2fScUnVQsaiAptGU3WFY37cCiRMKCnxfDJCmyWdLUqBc7SLM9kN9FkoFAjDd0HYocJgo0tCUQiiPnG1F0As5KPFD0wFoncbwQJQ5DkXAikqPIdBkJQdFUGQWNKSwLU420qUQ3iSwBF0hOvZIsKYvDTA0c0OJIriyK00YdObelgI6fSByKRRH2Y19EzNC01HUtUeNskN7PLATnPA0l1RUDzM3xXY50sgt3HcIA */
  id: "search",
  initial: "idle",
  context: {
    currentQ: "",
    data: {},
    selectedFilters: [],
  },
  states: {
    idle: {
      on: {
        FILTER: {
          //   guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            selectedFilters: ({ event }) => {
              console.log("FILTER", event);
              return event.filters;
            },
            currentQ: ({ context }) => {
              console.log("currentQ", context);
              return context.currentQ;
            }, // Preserve currentQ
          }),
          target: "filtering",
        },
        SEARCH: {
          //   guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            currentQ: ({ event }) => {
              return event.q;
            },
          }),
          target: "idle",
        },
      },
    },
    filtering: {
      type: "parallel",
      initial: "search",
      states: {
        search: {
          initial: "searching",
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
          states: {
            filtering: {
              invoke: {
                src: "getFacets",
                input: ({ context }) => ({
                  filters: context.selectedFilters,
                }),
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
  },
  guards: {
    hasFilters: ({ context }) => {
      return context.filters.length > 0;
    },
    hasSearchString: ({ context }) => {
      return context.q;
    },
  },
});
