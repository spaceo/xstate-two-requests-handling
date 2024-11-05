"use client";

import { useSearchParams } from "next/navigation";
import { SearchMachineContext } from "./SearchMachineContext";
import { useActorRef } from "@xstate/react";
import searchMachine from "./search.machine";
import { ReactNode } from "react";

export const SearchMachineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const searchParamsFilter = searchParams.getAll("filter") ?? [];

  const actorRef = useActorRef(searchMachine, {
    input: {
      q: searchParams.get("q") ?? "",
      filters: searchParamsFilter,
      knownFilters: [
        {
          id: "apple",
          label: "Æble",
        },
        {
          id: "horse",
          label: "Hest",
        },
        {
          id: "cannibal",
          label: "Kannibal",
        },
      ],
    },
  });

  return (
    <SearchMachineContext.Provider value={{ actor: actorRef }}>
      {children}
    </SearchMachineContext.Provider>
  );
};
