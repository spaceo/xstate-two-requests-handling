"use client";
import { Input } from "@/components/ui/input";
import { useMachine } from "@xstate/react";
import searchMachine from "../search.machine";

export default function SearchField() {
  const [state, send] = useMachine(searchMachine, {
    inspect: (inspectionEvent) => {
      // type: '@xstate.actor' or
      // type: '@xstate.snapshot' or
      // type: '@xstate.event'
      //   console.log("SearchField input", inspectionEvent.actorRef.options.input);
      console.log("SearchField input", inspectionEvent);
    },
  });
  //   console.log(state.value, state.context);

  //   console.log(state.value, state.context);
  return (
    <div className="m-20 clear-both">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) => send({ type: "SEARCH", q: value })}
      />
    </div>
  );
}
