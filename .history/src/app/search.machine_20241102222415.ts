import { fromPromise, setup } from "xstate";

export const machine = setup({
  actors: {
    search: fromPromise(
      async ({ input }: { input: { q: string } }) => {
        console.log("Searching for:", input.q);

            return fetch(`http://localhost:3005/search`);
    ),
  },
}).createMachine({
  id: "coffee",
  initial: "preparing",
  states: {
    preparing: {
      states: {
        grindBeans: {
          initial: "grindingBeans",
          states: {
            grindingBeans: {
              on: {
                BEANS_GROUND: {
                  target: "beansGround",
                },
              },
            },
            beansGround: {
              type: "final",
            },
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
        target: "makingCoffee",
      },
    },
    makingCoffee: {},
  },
});
