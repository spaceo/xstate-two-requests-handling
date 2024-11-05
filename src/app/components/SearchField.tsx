"use client";
import { Input } from "@/components/ui/input";
import actor from "@/machines/search/search.actor";
import { useSelector } from "@xstate/react";

export default function SearchField() {
  const currentQ = useSelector(actor, (snapshot) => {
    return snapshot.context.currentQ;
  });

  return (
    <div className="m-20 clear-both">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) =>
          actor.send({ type: "TYPING", q: value })
        }
        value={currentQ}
      />
      <button onClick={() => actor.send({ type: "SEARCH" })}>Search</button>
    </div>
  );
}
