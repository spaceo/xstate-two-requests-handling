import { createActor } from "xstate";
import searchMachine from "./search.machine";

export default createActor(searchMachine).start();
