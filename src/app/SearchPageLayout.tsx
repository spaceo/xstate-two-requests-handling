"use client";

import SearchField from "./components/SearchField";
import SearchFilters from "./components/SearchFilters";
import SearchResult from "./components/SearchResult";
import { SearchMachineProvider } from "@/machines/search/SearchMachineProvider";

export default function SearchPageLayout() {
  return (
    <div>
      <SearchMachineProvider>
        <SearchField />
        <SearchFilters />
        <SearchResult />
      </SearchMachineProvider>
    </div>
  );
}
