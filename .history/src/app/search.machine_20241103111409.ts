import { set } from "react-hook-form";
import { assign, fromPromise, setup } from "xstate";

export default setup({
  context: {
    q: "",
    data: {},
    filters: [],
  },
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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwBmVrgAsATjUqAbAFZWAJlYylcgDQgAnog2sNuDQHYZADiVKZGlXY2uAvt9MoMHAJiMgBlegBBRgBhAAk2TiQQPgFhMQlpBENFVXVtPQMjUwsEfTllTy0NGTsVAw05GS1ffzQsPAAzfCJBMHR8UShSCDEwXFhBVF7xtqCunr6BqASJFKERcSTM7OV1TR19QxNzRC0tFVwap10tJVZbx0cVFpAA9tx53v7BmcDsYdGBFEADdeABrMZvObdL5LX7tBADUGYKYbBIrJJrNKbUCZBTlez7XIaJ5OYqnAy4FRaBSODQkxx2LS6G4vKGdGGLH7s0h9dC8dC4bhEKYdAUAW3h0IW3ygUuwiJBvBR2PRHFW-HW6S2iAUSlwciUnmq+ScriU5IQSluyhpMl08lucl0ho0bNmHJlcM+fQBojGSPBkI9H05stDMsVyNRYjViR4muxGV1bgN9qUjjkOlpNUtTPKdysKlcdNYKmc7r+EdhPx96F56H5guFool8urXLldajypjojjGtSG2TCEaNnLrCM9l02l0TI0efuVOs9seWjc7jdfleIfZcJ5I39QNBEPbe+5Hp7KrRHAxCaH2txlgzuCZMjqVVYji03+OJR-uBPNSjiGPS9J2EyzTbuy8reqg3QAK7oGQkgTFMYyoB0XwABQyKw+EAJSkDB55dvBRBIWAd7JImw46gg67lLUZbONa76Tiolobq+7hZioTSsI0zhQduoi8BAcASOyg5ajiUiIAAtAuJwIApMipnhk7qXOmgsh4lbvIQJAyUm9FKLoloOvq35NNULpyPSuguAZ0o1lAJl0U+pTmZcXhaawdiZs6WiWg5452u+cjfnO9wuZ6bnyh5j7yaUdS+XcrgBUFNyWlYOQrioc6ePamhxR24Z1klcl4nor6aI4ujUva8hMpaNmAec+h6HYhpMnYZWkVVI5hQa1r0uuujfvYniWgpk22PhdwqI09x2Ph2gDR6+4ekN9ENFouAuhojVuHUeg-lxWh2AazIkpBGWMZtfxwYhyG7V55qjVU2irlUEHKSUbgHZ4y2bta1p2EoW6+EAA */
  id: "search",
  initial: "idle",
  states: {
    idle: {
      on: {
        FILTER: {
          guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            filters: ({ event }) => {
              //   console.log({ event });
              return event.value;
            },
          }),
          target: "filtering",
        },
        SEARCH: "searching",
      },
    },
    filtering: {
      states: {
        search: {
          invoke: {
            src: "performSearch",
            input: ({ event, context }) => {
              console.log("Filtering search input", event, context);
              return {
                q: event.q,
                filters: context.filters,
              };
            },
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
            onError: {},
          },
        },
        filter: {
          invoke: {
            src: "getFacets",
            input: ({ event }) => ({
              filters: event.filters,
            }),
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
            },
            onError: {},
          },
        },
      },
      type: "parallel",
      onDone: {
        target: "#search.idle",
      },
    },
    searching: {
      initial: "search",
      states: {
        search: {
          invoke: {
            guard: "hasSearchString",
            src: "performSearch",
            input: ({ event }) => ({
              q: event.q,
            }),
            onDone: {
              actions: assign({
                data: ({ event }) => event.output,
              }),
              target: "#search.idle",
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
    hasSearchString: ({ context }) => {
      return context.q;
    },
  },
});
