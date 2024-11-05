import { createActor } from "xstate";
import { getInitialUrlParams, updateUrlParams } from "./helper";
import searchMachine from "./search.machine";

const knownFilters = [
  {
    id: "apple",
    label: "Æble",
  },
  {
    id: "horse",
    label: "Hest",
  },
  {
    id: "cannibal",
    label: "Kannibal",
  },
] as const;

const { q, filters } = getInitialUrlParams(knownFilters);
const actor = createActor(searchMachine, {
  input: {
    q,
    filters,
    knownFilters,
  },
});

// Update URL params on state changes
const subscription = actor.subscribe({
  next(snapshot) {
    const {
      context: { currentQ: q, selectedFilters: filters },
    } = snapshot;
    updateUrlParams({ q, filters });
  },
});

actor.start();

export default actor;
