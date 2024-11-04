import { createMachine, setup } from "xstate";

export const machine = setup({
  actors: {
    sendEmail: fromPromise(
      async ({ input }: { input: { customer: string } }) => {
        console.log("Sending email to", input.customer);

        await new Promise<void>((resolve) =>
          setTimeout(() => {
            console.log("Email sent to", input.customer);
            resolve();
          }, 1000)
        );
      }
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
