"use client";

import useSearchMachineActor from "@/machines/search/useSearchMachineActor";
import { useSelector } from "@xstate/react";

export default function SearchResult() {
  const actor = useSearchMachineActor();
  const machineContext = useSelector(actor, (snapshot) => snapshot.context);
  return (
    <div>
      <pre>{JSON.stringify(machineContext, null, 2)}</pre>
    </div>
  );
}
