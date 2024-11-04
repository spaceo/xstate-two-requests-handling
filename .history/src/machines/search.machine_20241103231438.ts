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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwBWAGy4FAdgCcCzfLUAOBQCYdAGhABPRAGYLS1vosAWAzItz1OnQF8PJlBhwFiMloATQAFSgA5AHE2TiQQPgFhMQlpBHt9E3MEfQV7XEcXBWcdezk1dXsvHzQsPEISUgBlegBBRgBhAAlYiUShEXF4tPklVQ0tcr1DLMR1OVxWJdYVfUcFUpXqkF863AAzfCJBMHR8UShcXf9r7HOoUggxMAJRADdeAGsX24Ojk7OFyutRuILuFwQ5w+mFQyVEsV68X6cNSiDkilwan0MlKVmxpUUsxyKnycjs9gsKlYFSKLm2v0Ox1O92Bfjwt3upFO6F46Fw3CIsP2vIAtqy9oyASzfhyIVDeDC4QiOH1+AMUsNLPYVMp7GVsRS1ks5ET9PpWLg5MtbM5zSoLDJ9PSwX8mYDLpLTq6pRdHs9Xh9vuL-J73d6vaH7pD3grYYNlXEeGqUZqEGSxooZFirKwdCoZAoiXILPpFnZFOoLHpdJ5vDsXZGgaHw+6uegeXyBULRcG8I2Pf8I4P3dHoXGxAnVUlBqiEA4dXk9WpWGSlgoHETtTpFst8zJ7Hn7M4VM62b3pWDOU9RC95UGZZegbKoKPY0qOIik9ONaA0ooLboSz5lo+gVCaZiIO4Sh5rYrA4joFi2NYp57M+56+tyvL8oKgjCugYoPmyF5EXKMaKvGH4qkiyYzqmLgyLgVL6PaFKjAheZEghpalKomhqDIKgkqwFheHWoi8BAcASLcU7qkMv6IAAtIWEEIIpR6YmoWladiCi6HpVR1r8DRgLJKYKWmOpyDouhWAeek4vo4HZNYCz8ZoBJHhYugqHIKEhsO9xmbRFl2DqjjUtiKwCc4R6bgsVrWvmrAOawhk1Ge-a9sFP5SIghgLBFWIyNF+YbqptqaVpVJWsuZT+X2gVPi6z45fJeVzlYBQKJFJX5mV9imqsVUVParlqPYaUNS2xF7NepnUd+7VpL5270cWGQOHkhKqaBCxOUshiTRovkyNNWWhm1s4Fd1vWlbFRLeRaiXCWoZKuLaflGQ2TUDm6M0XFddFdUVUX9Q9qnFs9SwlToAmVgoX0ZRKv0trg81AxZek6jo5p2Ga6ajUWcj5NaWk9dS1kid9Z6tYtcnXTZlpZjIOL2DWhiZKpJILFtqhHjZ1ZI-WtOPpcdNfgzwNWSzbMc7jnE6Lzjg6K9jhqC46Ui6hYvo88mMdSoBgFNSRtOUJYFEsu248fM1haa4TqiUAA */
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
