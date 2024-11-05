import { useContext, useEffect } from "react";
import { SearchMachineContext } from "./SearchMachineContext";
import { useRouter } from "next/navigation";
import { usePathname, useSearchParams } from "next/navigation";

const useSearchMachineActor = () => {
  const { actor } = useContext(SearchMachineContext);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const subscription = actor.subscribe({
      next(snapshot) {
        const {
          context: { currentQ: q, selectedFilters: filters },
        } = snapshot;
        const params = new URLSearchParams(searchParams.toString());
        params.delete("q");
        if (q) {
          params.set("q", q);
        }
        params.delete("filter");
        filters.forEach((filter) => {
          params.append("filter", filter);
        });
        replace(`${pathname}?${params.toString()}`);
      },
    });

    return subscription.unsubscribe;
  }, [actor.id]);

  return actor;
};

export default useSearchMachineActor;
