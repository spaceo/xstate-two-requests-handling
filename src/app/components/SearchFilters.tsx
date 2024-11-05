"use client";

import { Checkbox } from "@/components/ui/checkbox";
import useSearchMachineActor from "@/machines/search/useSearchMachineActor";
import { useSelector } from "@xstate/react";
import { Snapshot } from "xstate";

export default function SearchFilters() {
  const actor = useSearchMachineActor();
  const selectedFilters = useSelector(
    actor,
    (snapshot) => snapshot.context.selectedFilters
  );
  const knownFilters = useSelector(
    actor,
    (snapshot) => snapshot.context.knownFilters
  );

  return (
    <div>
      {knownFilters.map((item) => (
        <div key={item.id}>
          <div>
            <label
              htmlFor={item.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {item.label}
            </label>
          </div>
          <Checkbox
            id={item.id}
            name="items"
            value={item.id}
            checked={selectedFilters.includes(item.id)}
            onClick={() => {
              actor.send({
                type: "TOGGLE_FILTER",
                filter: item.id,
              });
            }}
          />
        </div>
      ))}
    </div>
  );
}
