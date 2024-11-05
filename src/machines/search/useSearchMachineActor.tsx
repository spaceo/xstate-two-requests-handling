import { useContext } from "react";
import { SearchMachineContext } from "./SearchMachineContext";

const useSearchMachineActor = () => {
  const { actor } = useContext(SearchMachineContext);

  return actor;
};

export default useSearchMachineActor;
