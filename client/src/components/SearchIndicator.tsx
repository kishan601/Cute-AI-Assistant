import { Search, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchIndicatorProps {
  isSearching: boolean;
}

const SearchIndicator = ({ isSearching }: SearchIndicatorProps) => {
  if (!isSearching) return null;
  
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 py-2 px-3 rounded-full">
        <div className="flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 text-indigo-500 animate-spin" />
          <Globe className="h-3.5 w-3.5 text-indigo-500" />
        </div>
        <span>Searching the internet...</span>
      </div>
    </div>
  );
};

export default SearchIndicator;