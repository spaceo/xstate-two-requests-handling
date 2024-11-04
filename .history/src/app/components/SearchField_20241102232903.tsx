"use client";
import { Input } from "@/components/ui/input";
import { useMachine } from "@xstate/react";
import searchMachine from "../search.machine";

export default function SearchField() {
  const [state, send] = useMachine(searchMachine);
  console.log(state);
  return (
    <div className="m-20">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) => send({ type: "SEARCH", q: value })}
      />
    </div>
  );
}