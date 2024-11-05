import SearchField from "./components/SearchField";
import SearchFilters from "./components/SearchFilters";
import SearchPageLayout from "./SearchPageLayout";

export default function Home() {
  return (
    <div className="grid  items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <SearchPageLayout />
    </div>
  );
}
