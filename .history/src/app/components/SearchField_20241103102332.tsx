"use client";
import { Input } from "@/components/ui/input";
import searchMachine from "../search.machine";
import { useMachine } from "@xstate-ninja/react";

export default function SearchField() {
  const [state, send, service] = useMachine(searchMachine, { devTools: true });

  console.log(state);
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
