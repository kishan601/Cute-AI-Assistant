import { Search, Globe, Loader2, Brain, Sparkles, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface SearchIndicatorProps {
  isSearching: boolean;
}

const SearchIndicator = ({ isSearching }: SearchIndicatorProps) => {
  const [dots, setDots] = useState("");
  const [currentIcon, setCurrentIcon] = useState(0);
  
  const thinkingIcons = [
    <Brain key="brain" className="h-5 w-5 text-indigo-500" />,
    <Sparkles key="sparkles" className="h-5 w-5 text-amber-500" />,
    <Globe key="globe" className="h-5 w-5 text-sky-500" />,
    <Zap key="zap" className="h-5 w-5 text-green-500" />
  ];
  
  // Animate the dots
  useEffect(() => {
    if (!isSearching) return;
    
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 600);
    
    return () => clearInterval(interval);
  }, [isSearching]);
  
  // Animate the icons
  useEffect(() => {
    if (!isSearching) return;
    
    const interval = setInterval(() => {
      setCurrentIcon(prev => (prev + 1) % thinkingIcons.length);
    }, 1500);
    
    return () => clearInterval(interval);
  }, [isSearching]);
  
  // Thinking messages to cycle through
  const thinkingMessages = [
    "Searching the internet",
    "Gathering information",
    "Finding relevant results",
    "Analyzing data"
  ];
  
  if (!isSearching) return null;
  
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="relative group">
        {/* Main indicator */}
        <div className="flex items-center gap-3 text-sm bg-white dark:bg-gray-800 py-3 px-4 rounded-lg border border-indigo-100 dark:border-indigo-900/30 shadow-md animate-pulse-once">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20">
            {/* Central spinning icon */}
            <Loader2 className="absolute h-6 w-6 text-indigo-500 animate-spin" />
            
            {/* Orbiting dots */}
            <div className="absolute w-full h-full">
              <div className="absolute w-2 h-2 rounded-full bg-indigo-400 animate-orbit" style={{ animationDelay: "0s" }}></div>
              <div className="absolute w-2 h-2 rounded-full bg-sky-400 animate-orbit" style={{ animationDelay: "1s" }}></div>
              <div className="absolute w-2 h-2 rounded-full bg-amber-400 animate-orbit" style={{ animationDelay: "2s" }}></div>
            </div>
          </div>
          
          <div className="flex flex-col">
            <div className="font-medium text-gray-800 dark:text-gray-200 flex items-center">
              {thinkingIcons[currentIcon]}
              <span className="ml-2">Thinking{dots}</span>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {thinkingMessages[currentIcon]}...
            </span>
          </div>
        </div>
        
        {/* Background glow effect on hover */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-lg blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      </div>
    </div>
  );
};

export default SearchIndicator;