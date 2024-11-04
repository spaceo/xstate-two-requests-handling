"use client";
import { Input } from "@/components/ui/input";
import searchMachine from "@/machines/search.machine";
import { useSelector } from "@xstate/react";

export default function SearchField() {
  const currentQ = useSelector(searchMachine, (snapshot) => {
    return snapshot.context.currentQ;
  });

  return (
    <div className="m-20 clear-both">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) =>
          searchMachine.send({ type: "TYPING", q: value })
        }
      />
      <button onClick={() => searchMachine.send({ type: "SEARCH" })}>
        Search
      </button>
    </div>
  );
}
