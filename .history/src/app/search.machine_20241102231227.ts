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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwBmVrgCsrVawBscgJwAmABysdAFj0AaEAE9ESmTtysT61gHZncva+0BfL+ZQYcAmIyAGV6AEFGAGEACTZOJBA+AWExCWkEGSNFFTVNXQNjM0tEHVY5XCNndSVXJXyZVhklHz80LDwAM3wiQTB0fFEoUggxMFxYQVQ+ifbA7t7+wah4iWShEXFEjKyctQ1tfUMTcysEI3UjZUdmqr0tZyrWkH8O3AW+gaHZgOwRsYIogAbrwANbjV7zHqfZY-DoIQYgzDTTbxVaJdapLagDJ6DzKLRyZxKDxOPQ1ZynRAXLTKOSXORZdSEqpyFq+F5zLrQpbfD79f6icaIsEQrnvHlfKASxboBHA3jIrFojhrfgbNLbRAKCrqZxadR6OT0zR6IxU85KK5GJQKLQGdyqVxGZ6Q7my2H89CkfroXjoXDcIjTTr+gC2cKhHr5kvlSJRYhVCR46qx6WpRtwbMJziNhxkFtqzkqGh08mN9zqrvFXs9qB6AFd0GRJJNpuNUJ1PgAKRqqACUpDdMphfPrRCbYHRKZSm3TCGJdk0+maMicOh06nUhdcJfUZeN7gexOrv0j2FhbsFwoV4PP58vXLjioToiTatnmpx1h0tOZtsZQw5DKYCLVXew1DkbItHkVhbWcU83jdOtG2bUhWymGZOx7PtWEHYdkLHVCp1VDFUznLUEG0K43CMdxHg3eojALEoEB0ElcHJe1mgNVhCStdkOVEXgIDgCQ3Q-DVsSkRAAFpt1Y2TjEQwJCBISS00oowdAtMsrj0Gx6jNck3D4lT3VHKANIo782O03A12yLdLmY9idDkC0TVwLRbSyEk1xkfiEI5Yda2+CSyM-aTcUeexcyyEDyRcQs9W8+4rU3DRAtzcyR15aUvWsr8ZLYrRFEcjQtyMVylB01ilFq7zSz4mRHgMvQZFysKCvHSciuixAagqGQPBUAxmTKtkd3UPcN2qdz3Ia3LCKsyKpPnYxi30MqHWA4w+K0C1NGUNRWocepasNZauUfX5+vnGwZtah4sgUPjqvNVjjFpG1GRtDcOoavRrt+FCJ2be7KN-JRcG21hdo3ZjdNqTjmVzfdjhUK0fB8IA */
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
            onError: {},
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
            onError: {},
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
