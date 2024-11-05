"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SearchMachineContext } from "./SearchMachineContext";
import { useActorRef } from "@xstate/react";
import searchMachine from "./search.machine";
import { ReactNode, useEffect } from "react";

export const SearchMachineProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const searchParams = useSearchParams();
  const { replace } = useRouter();
  const pathname = usePathname();
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

  useEffect(() => {
    const subscription = actorRef.subscribe({
      next(snapshot) {
        const {
          context: { currentQ: q, selectedFilters: filters },
        } = snapshot;
        const params = new URLSearchParams(searchParams.toString());
        params.set("q", q);
        params.delete("filter");
        filters.forEach((filter) => {
          params.append("filter", filter);
        });
        replace(`${pathname}?${params.toString()}`);
      },
    });

    return subscription.unsubscribe;
  }, [actorRef]); // note: actor ref should never change

  return (
    <SearchMachineContext.Provider value={{ actor: actorRef }}>
      {children}
    </SearchMachineContext.Provider>
  );
};
