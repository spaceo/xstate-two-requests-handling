"use client";
import { Input } from "@/components/ui/input";
import { useMachine } from "@xstate/react";
import searchMachine from "../search.machine";

export default function SearchField() {
  //   const [state, send] = useMachine(searchMachine);

  return (
    <div>
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) => console.log(e)}
      />
    </div>
  );
}
