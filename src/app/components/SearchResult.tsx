"use client";

import actor from "@/machines/search/search.actor";
import { useSelector } from "@xstate/react";

export default function SearchResult() {
  const machineContext = useSelector(actor, (snapshot) => snapshot.context);

  return (
    <div className="m-20 clear-both">
      <div className="min-h-700 mb-10">
        <pre>{JSON.stringify(machineContext, null, 2)}</pre>
      </div>
    </div>
  );
}
