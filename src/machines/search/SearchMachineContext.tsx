import { createContext } from "react";
import searchMachine from "./search.machine";
import { Actor } from "xstate";

export const SearchMachineContext = createContext({ actor: {} } as {
  actor: Actor<typeof searchMachine>;
});
