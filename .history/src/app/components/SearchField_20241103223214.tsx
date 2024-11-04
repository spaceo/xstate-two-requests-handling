"use client";
import { Input } from "@/components/ui/input";
import { useMachine, useSelector } from "@xstate/react";
import searchMachine from "../../machines/search.machine";
import searchMachineActor from "../../machines/search.machine.actor";

export default function SearchField() {
  //   const [state, send] = useMachine(searchMachine, {
  //     inspect: (inspectionEvent) => {
  //       // type: '@xstate.actor' or
  //       // type: '@xstate.snapshot' or
  //       // type: '@xstate.event'
  //       //   console.log(
  //       //     "SearchField - input",
  //       //     inspectionEvent.actorRef.options.input
  //       //   );
  //       //   console.log("SearchField - State id", inspectionEvent.actorRef.id);
  //     },
  //   });
  const xstateContext = useSelector(
    searchMachineActor,
    (snapshot) => snapshot.context
  );

  console.log(xstateContext, "SearchField component");

  //   console.log(state.value, state.context);
  return (
    <div className="m-20 clear-both">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) =>
          searchMachineActor.send({ type: "SEARCH", q: value })
        }
      />
    </div>
  );
}
