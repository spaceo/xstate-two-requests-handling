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
          body: JSON.stringify({ ...input }),
        });
      }
    ),
    getFacets: fromPromise(
      async ({
        input,
      }: {
        input: { q?: string; filters: Record<string, string[]> };
      }) => {
        return fetch(`http://localhost:3005/facets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input }),
        });
      }
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAKwAmADQgAnogAcARlwAWAJz7dcgMwB2VgDZWM7SYC+tpSgw4CxMrQCaABUoA5AOJsnEggfALCYhLSCGbmuBpqhhoarJrmutpqSqoIMnG6mmrarLpWrKwmGiYy9o5oWHiEJKQAyvQAgowAwgASQRJhQiLiIdEmcnEyZnKaBXLachq62bIm2riVuiZFrKZy4xq1IE4NuABm+ESCYOj4olC4Jy5P2HdQpBBiYASiAG68AGtvi9zpdrrd7o96s9oa97gg7v9MKgIqIgv0QoNUVFENoNDIdJZdKYZCsEHiTLh5gZjLErDYjiCLlcbm8oc48C83qQbuheOhcNwiCizvyALbs07M8FskFc+GI3jI1HojgDfhDSKjRAaIxGDZGbR6o3yUzmLIqRBGBLxKoyNTmXVqcaabSM2GglkQh7Sm6emX3D5fH7-IGSly+73+v2Rt4Iv5KlHDVXBHga7Ha8n4wklElk8xrDZ6fS0ixWGoOY4e2OQyPR7089B8gVCkXi8N4Gs+sExnve+NIpNiFPq8LDHEIXVxBJGGTE6r5uSsDYTGTWZ1ltfujkd2Ww7mfUTfRVhuX7yHyqADxMqjgYtNjrWgaJqIzLmQaORzz+zgoOsmLGoOgyOUrAaOY8ipKk5jbqcl67oGvL8oKwqCKK6ASmeHJ7thCoJsqyZ3mqmLpuOmalO+CwZPajppNoZLfrgujpNsxR7Ac9iVqIvAQHAEgvKOmojM+iAALTzDoehfsSWzmMY4HmGSolvrgH6aFMeLmMUr5GrBLhNGAgkZiJCByZSmSsEaajGPMizLJa5LaJMJgQeudJbpWTJ9m8RlkSZxiqSBaxlrS5qGmSGhGra1QOk6LqRXpnbeResK+U+UiIJUgUVMUliha+AEqY6MWOkYzozAlnnVslDxYQ0PkkY+wkZZOSzZcFeVmgVDmmMuxU0XFFVulVO5dvWaXNWM9EOTIepUqubmbhWdSjTV9b1g1D5CROn6KA5Bb6nIC2ZO5y1Vjul4TROr5Ab+s6LMkdEMZZhJbDs7GLIlCG1eeUBXZmagOrgd3yMkCTgdNORaesTlvWx4wcZxQA */
  id: "search",
  initial: "idle",
  context: {
    currentQ: "",
    searchData: {},
    facetData: {},
    selectedFilters: [],
  },
  states: {
    idle: {
      on: {
        FILTER: {
          //   guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            selectedFilters: ({ event }) => {
              return event.filters;
            },
          }),
          target: "filtering",
        },
        TYPING: {
          //   guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            currentQ: ({ event }) => {
              return event.q;
            },
          }),
        },
        SEARCH: {
          //   guards: ["hasFilters", "hasSearchString"],
          //
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
                  actions: assign({
                    facetData: ({ event }) => event.output,
                  }),
                  target: "#search.idle",
                },
                onError: {},
              },
            },
          },
        },
      },
    },
    searching: {
      initial: "resetFilters",
      states: {
        resetFilters: {
          actions: assign({
            searchData: ({ event }) => event.output,
          }),
          target: "searching",
        },
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
  guards: {
    hasFilters: ({ context }) => {
      return context.filters.length > 0;
    },
    hasSearchString: ({ context }) => {
      return context.q;
    },
  },
});
