import { createActor } from "xstate";
import searchMachine from "./search.machine";

export default createActor(searchMachine, {
  input: {
    selectedFilters: ["horse"],
  },
}).start();
