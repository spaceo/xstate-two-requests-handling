"use client";
import { Input } from "@/components/ui/input";
import machine from "../../machines/search.machine.actor";
import { useSelector } from "@xstate/react";

export default function SearchField() {
  const currentQ = useSelector(
    machine,
    (snapshot) => snapshot.context.currentQ
  );

  return (
    <div className="m-20 clear-both">
      <Input
        type="text"
        placeholder="Search"
        onChange={({ target: { value } }) =>
          machine.send({ type: "SEARCH", q: value })
        }
      />
    </div>
  );
}
