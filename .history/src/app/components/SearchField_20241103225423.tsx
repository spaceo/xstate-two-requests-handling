"use client";
import { Input } from "@/components/ui/input";
import searchMachineActor from "../../machines/search.machine.actor";
import { useSelector } from "@xstate/react";

export default function SearchField() {
  const xstateContext = useSelector(
    searchMachineActor,
    (snapshot) => snapshot.context
  );

  //   console.log(xstateContext, "SearchField component");

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
