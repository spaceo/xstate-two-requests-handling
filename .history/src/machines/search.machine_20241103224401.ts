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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwA2GbgDsADgCcrOSrlq5AJgDMAVjkGANCACeiPQBZWuNfKWttKo4ZXGAvt4soMHAJiMgBlegBBRgBhAAk2TiQQPgFhMQlpBFs9C2sEXVwjWx1WWyUdJ1YlJV9-NCw8ADN8IkEwdHxRKFIIMTBcWEFUNoH6oObW9s6oBIkUoRFxJMz5RVUNLR19Y1Nc2TUDXFtnGTtbdT1dPVqQAIbcCbaOrtHA7B6+glEAN14Aa36d3GLSe01eDQQnV+mGGiwSsyS8zSS1AmSMBlsjhk9mKrCqMhUShyVhsrCMuFYhlsBjcciJalsNyBTRBUxezNI7XQvHQuG4RGGjR5AFtwcDJs8oGLsJCfrwYcj4Rw5vwFullogDHpyaY6TIDnp3OojHsEDIjA41Farfo1NVtaYmWMWRKwY92h9RP0of9Ac6HqzJQGJbLobCxErEjxVciMoh0ZinDi5HilASiaaDKYKYZ0SpWM5WGojE63sHQS93ehOehubz+YKRdLy2ypVXQ-Lw6JIyrUos4whjOSNFSlMZXPoTJmixS8ZSlCYjPm1NcbqJeBA4BJmb21SipIgALRyU2Huyl+6EEi72MahAp3DY2zooxOLR6LRqU36lSzvHPpR7AMIsaj8W5-SraYb37O8P0OZ8DBkYCjCMMcZFUU1swtOc7HnRCtTkC9xQrKUd0RGMYNRTUZEUBCkLJVDEIwkkED0Vh4OtFcE3Y6kiJdEiW3QaD1SowdjmUdMl1Q4sNC-Fis0UbCiwJOR7CfPjBLBWAAFdMEwOBYFCZ0oPIvsRIPBAxzkXAMQMBcaTkJc1HcU09G1ZQlItAwsxUexCLA5lNPZXT9NgWByEDEzozM-dMismzqXs7QnJc+SvA8gtSizLNVPNXxfCAA */
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
      states: {
        search: {
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
              target: "successSearching",
            },
            onError: {},
          },
        },
        filter: {
          invoke: {
            src: "getFacets",
            input: ({ context }) => ({
              filters: context.selectedFilters,
            }),
            onDone: {
              actions: assign({
                facetDate: ({ event }) => event.output,
              }),
              target: "successFiltering",
            },
            onError: {},
          },
        },
        successSearching: { type: "final" },
        successFiltering: { type: "final" },
      },
      type: "parallel",
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
