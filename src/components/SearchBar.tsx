import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, LocateFixed, MapPin } from "lucide-react"; 
import { useGeolocation } from "@/hooks/useGeolocation";
import React, { useEffect } from "react";

interface SearchBarProps {
    initialKeyword ?: string;
    initialLocation ?: string;
    onKeywordSearch: (value: string) => void;
    onLocationSearch: (value: string) => void;
  }

export default function SearchBar({
    initialKeyword = "",
    initialLocation = "",
    onKeywordSearch,
    onLocationSearch,
}: SearchBarProps) {

    const { location, isActive, handleGetLocation } = useGeolocation();

    const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onKeywordSearch(e.target.value);
    };

    const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onLocationSearch(e.target.value);
    };

    useEffect(() => {
        if (location) {
            onLocationSearch(location);
        }
    },[location, onLocationSearch]);

  return (
    <div className={`w-full pt-10 p-4 flex justify-center transition-all duration-300`}>
      <div className="flex items-center w-full max-w-xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl rounded-lg border border-gray-300 shadow-md bg-white overflow-hidden">
        <div className="relative flex items-center flex-grow px-2 sm:px-3 md:px-4">
          <Search className="absolute left-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={initialKeyword}
            onChange={handleKeywordChange}
            placeholder="Search by: Job title, Position, Keyword, City, State or Country..."
            className="h-10 sm:h-12 border-none pl-8 sm:pl-10 pr-8 sm:pr-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <LocateFixed
            className={`absolute right-3 h-5 w-5 cursor-pointer sm:hidden ${
              isActive ? "text-blue-600" : "text-gray-400"
            }`}
            onClick={handleGetLocation}
          />
        </div>
        <div className="h-8 w-px bg-gray-300 mx-1 sm:mx-2 hidden sm:block" />
        <div className="relative items-center flex-grow px-2 sm:px-4 hidden sm:flex">
          <MapPin className="absolute left-3 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            value={initialLocation}
            onChange={handleLocationChange}
            placeholder="City, state or country"
            className="h-10 sm:h-12 border-none pl-8 sm:pl-10 pr-8 sm:pr-10 text-xs sm:text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <LocateFixed
            className={`absolute right-3 h-5 w-5 cursor-pointer hidden sm:block ${
              isActive ? "text-blue-600" : "text-gray-400"
            }`}
            onClick={handleGetLocation}
          />
        </div>
        <Button
          className="h-10 sm:h-12 px-4 sm:px-6 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-none sm:rounded-r-lg sm:ml-2"
        >
          Find Job
        </Button>
      </div>
    </div>
  );
}