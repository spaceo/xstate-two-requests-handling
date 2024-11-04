import { set } from "react-hook-form";
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
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwBmVrgAsATjVq5KuQFYAbACYVAdgA0IAJ6Jtq3HN3GAHA5msV+pXJkBfL2ZQYcAmIyAGV6AEFGAGEACTZOJBA+AWExCWkEGW1FVXUtLT1DUwtZF1wjIzklIt0nXT0lHz80LDwAM3wiQTB0fFEoUggxMFxYQVRu0ZbAjq6evqh4iWShEXFEjJklHLz8nQNjM0sEbJlcB3sjB0N5JW05OSaQf1bcWe7e-qmA7EHhglEADdeABrEYvGadD4Lb6tBB9YGYCZreJLRIrVLrUAZbTyXAGU4yFQyBysPQyI5WPFKIz1DwebRGPS6J4Q9pQ+ZfNmkHroXjoXDcIgTNr8gC2sMhc0+UEl2HhQN4SMxqI4y34qzSG0QCiUthpuiZriq8jJlIQdxUynuMhklXsul0HlZ03Z0ph7x6f1EIwRoPBrreHJlQelCsRyLEqoSPA1mPSVLk+P0hOJpPJ5sNZwNek88ltSkavmegc9IbLPPQfIFQpF4rloehXzL4aVkdE0fVKTWCYQDz1unknlY+ltMkNrF0mbt1rzKm0DjznhdPzlMO5Qx9AOBYIbbPXrtbypRHDRse7Wuxsmyyl2mn2RXN+gut7UTmfTOy9RXr33zdQnQAK7oGQkhjBMIyoG0HwABQuKwrAAJSkGya7-kBIFnkkcY9tqFqsHqlQeJoKi6HIFxaOadraK+KgOEYJKsNcBI+MWoi8BAcASGyXaaliUiIAAtFOJQIIJ7i4AhCEyM+1wLpUk4-oEhAkLx8Z4dUVE0uU6gOMY0lGGSSluk2UBqbhV4IO4+i4OO2xOmRGiVNo5pyAxuDzp4+j6AR7haCyxaoWWB4-OZl4CVZKiKHZk5KI5WjOeauJnJ5Li4qwWR3CmxmNpysplmF-EZHIPnKEUdreeOCHuJm9geTa7gVHpI4qDlwVcoBmCYHAsAhK6CyFb2DE0WSNL6JUWQKRSon3HqPnDoYcWGSoRbNKu7WyrAnXdbAsDkMGA3ojh4UZMNknWEY42eIyCjTcc9g2fNTG0qRfn6Dlf5mUdF5FYgKZGLgz5RQYhrXDSLmiWRtHEvotSkRcH39VyrqDXh2iw7ZRjw0t5HbHIVE3rsMn2Hp46Iz8HoAUQwFgKjlkKDRQOTrDVyNRDxx2nquR0Qu1hKCS5GsV4QA */
  id: "search",
  initial: "idle",
  states: {
    idle: {
      on: {
        FILTER: {
          guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            selectedFilters: ({ event }) => {
              console.log("FILTER", event);
              return event.filters;
            },
          }),
          target: "idle",
        },
        SEARCH: {
          guards: ["hasFilters", "hasSearchString"],
          actions: assign({
            currentQ: ({ event }) => {
              return event.q;
            },
          }),
          target: "searching",
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
