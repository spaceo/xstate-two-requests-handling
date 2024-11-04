import SearchField from "./components/SearchField";
import SearchFilters from "./components/SearchFilters";
import SearchResult from "./components/SearchResult";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <p>Xstate experiments</p>
      <SearchField />
      <SearchFilters />
      <SearchResult />
    </div>
  );

}
