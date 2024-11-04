import { fromPromise, setup } from "xstate";

export const machine = setup({
  actors: {
    search: fromPromise(async ({ input }: { input: { q: string } }) => {
      console.log("Searching for:", input.q);

      return fetch(`http://localhost:3005/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: input.q }),
      });
    }),
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
            src: "sendEmail",
            input: ({ context }) => ({
              customer: context.customer,
            }),
            onDone: "Email sent",
          },
        },
        boilWater: {
          initial: "boilingWater",
          states: {
            boilingWater: {
              on: {
                WATER_BOILED: {
                  target: "waterBoiled",
                },
              },
            },
            waterBoiled: {
              type: "final",
            },
          },
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
