"use client";

import searchMachine from "@/machines/search.machine";
import { useSelector } from "@xstate/react";

export default function SearchResult() {
  const machineContext = useSelector(
    searchMachine,
    (snapshot) => snapshot.context
  );

  return (
    <div className="m-20 clear-both">
      <div className="min-h-700 mb-10">
        <pre>{JSON.stringify(machineContext, null, 2)}</pre>
      </div>
    </div>
  );
}
