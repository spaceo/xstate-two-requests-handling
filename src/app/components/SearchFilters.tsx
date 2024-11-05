"use client";

import { Checkbox } from "@/components/ui/checkbox";
import searchMachine, { knownFilters } from "@/machines/search.machine";
import { useSelector } from "@xstate/react";

export default function SearchFilters() {
  const selectedFilters = useSelector(
    searchMachine,
    (snapshot) => snapshot.context.selectedFilters
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
              searchMachine.send({
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
