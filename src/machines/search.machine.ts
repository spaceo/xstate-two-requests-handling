import { assign, createActor, fromPromise, setup } from "xstate";

const machine = setup({
  types: {
    context: {} as {
      currentQ: string;
      searchData: Record<string, unknown>;
      facetData: Record<string, unknown>;
      selectedFilters: string[];
    },
    input: {} as {
      selectedFilters: string[];
    },
  },
  actors: {
    performSearch: fromPromise(
      async ({ input }: { input: { q: string; filters: string[] } }) => {
        return fetch(`http://localhost:3005/search`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input }),
        }).then((res) => res.json());
      }
    ),
    getFacets: fromPromise(
      async ({ input }: { input: { q: string; filters: string[] } }) => {
        return fetch(`http://localhost:3005/facets`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...input }),
        }).then((res) => res.json());
      }
    ),
  },
  guards: {
    hasSearchString: ({ context }) => {
      return Boolean(context.currentQ && context.currentQ.length > 0);
    },
    filterNotAlreadySelected: ({ context, event }) => {
      return !context.selectedFilters.includes(event.filter);
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlhADZgDEAYgJIAyAKgKIBKA2gAwC6ioADgPaz4ALvl4A7LiAAeiAIwBWAGy4FAdgCcKgMwKFmtWu06ANCACeidXNwAmawoAs1markAOGfoC+nkygw4CYjJaAE0ABUoAOQBxNk4kED4BYTEJaQQAWnk1XDk5NR0FV017VhVXVk0TcwQ5ctwVezV7ByLXFVY1OW9fNCw8QhJSAGV6AEFGAGEACTiJJKERcQT0rPlcSr1NRut3Is0qs0QDBs0K1jLFfMV7HpA-ftwAM3wiQTB0fFEoUggxMFwsEEqHegL6ARebw+XygcwSCxSy1A6XkSlUGkMegMhWqFnsKgadkcZQOXQMdweENe70+3zB-jwlOwMN+-wIogAbrwANYApnPanQun8pkwhBfLmYEFLOJwnj8RapFaIdoyGyuNTOHZFTWuXG1BRWFSNVSudwySrdHz3cF4SE0mH0x6i76kD7oXjoXDcIggp6egC2TqpUNpUGDjNtYolvCliNlHHmCsRaUQOmsGxkMncFQ1mmz+rkWYaResKlsCmyuwptoFocd9o+dYdrr+ogBMd5EebQvDja9-ejnNj0rECfi8uSS1TCFc9jV9ns+ca+jJ7n1rgUOQuGnLcha+TUrhrDJ7YbPZ5Z7s93t9gn96CD-MHdP7l++4uHcZlHDliWT07Kgg6a4EuMgtCoW5Loahw1O49i4Eeui2Kw9iuNYXQKCezpRsKuE-G2HbDl2Ir4RGQ6SqOojjkmU5KsiiB2BsrhyJo1ioWSrDtC0+rWHUNgaJ0FydPoZy3NapEMo6Lo-NeXo+n6gbdjJ5EfjG35jr+ibwgB9FSIgjiaIhThqKw1glFsi76vIarCTuzgVPOJTeNaoi8BAcASEytGKki+mZOxBJ5AUOjFKU5SVPqGTmYhq6mTI7FmglKjYQEgxgD5KZAfxbhIforH5OZMgbqwVjyBhMgdIuzQKNYqV2oKYaZYBDG1EWuDoeh2ZsZq+T2PqBxKCopbsauGpaPV77ht5Ol0X56SHh1uxOMUFV9fqjgIXxCUtLoZT2EWk0vtNtYyc1enpA4BKdStPXZP1RwGltpZaOxJSseJvSnsd3aEed82yGUGYqNmc7yHIqG6Hqj1uEoEMJR4ujgYuVpfY8P39v9M4KBcNj4u0JRlvBCj6uWBJoVD3EHQeR2NQ2jVTVjQEOK4ePlFojjlOBJOPZu5OboYBjxehtP1q+DN-bNvkzhaCXKEDrDZOWTgPXBGqnLodT5m4IOfTap5nVLWWtdoapaMUmgXEWxP6rouR2XxTQkp0k0qYbk7S0BpQ5ObBxW9m3O8ZUoGrjozgWli4neEAA */
  id: "search",
  initial: "idle",
  context: ({ input }) => ({
    currentQ: "",
    searchData: {},
    facetData: {},
    selectedFilters: input.selectedFilters ?? [],
  }),
  states: {
    idle: {
      on: {
        TOGGLE_FILTER: {
          actions: assign({
            selectedFilters: ({ event, context }) => {
              if (context.selectedFilters.includes(event.filter)) {
                return context.selectedFilters.filter(
                  (filter) => filter !== event.filter
                );
              }
              return [...context.selectedFilters, event.filter];
            },
          }),
          target: "filtering",
        },
        TYPING: {
          actions: assign({
            currentQ: ({ event }) => {
              return event.q;
            },
          }),
        },
        SEARCH: {
          guard: "hasSearchString",
          actions: assign(() => ({
            selectedFilters: [],
          })),
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
                input: ({ context }) => {
                  return {
                    q: context.currentQ,
                    filters: context.selectedFilters,
                  };
                },
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
});

export default createActor(machine, {
  input: {
    selectedFilters: ["horse"],
  },
}).start();
