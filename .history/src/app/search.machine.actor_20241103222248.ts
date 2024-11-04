import { createActor } from "xstate";
import searchMachine from "./search.machine";

export const actor = createActor(searchMachine).start();
