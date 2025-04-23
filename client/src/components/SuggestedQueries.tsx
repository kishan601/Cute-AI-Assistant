import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MessageCircle, Map, Thermometer, Smile, Bot, Zap, Star, Award, Search, Coffee, Utensils, Cake } from "lucide-react";
import { useState, useEffect } from "react";

interface SuggestedQueriesProps {
  onQueryClick: (query: string) => void;
}

const SuggestedQueries = ({ onQueryClick }: SuggestedQueriesProps) => {
  const [visibleItems, setVisibleItems] = useState<number[]>([]);
  
  const suggestions = [
    {
      question: "What can you help me with?",
      description: "Learn more about my capabilities",
      icon: <Bot className="h-5 w-5 text-indigo-500" />,
      color: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-100 dark:border-indigo-800/30"
    },
    {
      question: "Search for the latest news today",
      description: "Get current news from the internet",
      icon: <Search className="h-5 w-5 text-sky-500" />,
      color: "bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800/30"
    },
    {
      question: "Find an easy chocolate cupcake recipe",
      description: "Get delicious baking recipes",
      icon: <Cake className="h-5 w-5 text-pink-500" />,
      color: "bg-pink-50 dark:bg-pink-900/20 border-pink-100 dark:border-pink-800/30"
    },
    {
      question: "How to make the best chocolate milkshake",
      description: "Find tasty drink recipes",
      icon: <Coffee className="h-5 w-5 text-amber-500" />,
      color: "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800/30"
    },
    {
      question: "What are the top movies of 2023?",
      description: "Find trending entertainment information",
      icon: <Star className="h-5 w-5 text-purple-500" />,
      color: "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30"
    },
    {
      question: "Find information about climate change",
      description: "Research environmental topics online",
      icon: <Zap className="h-5 w-5 text-green-500" />,
      color: "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30"
    }
  ];

  // Animation for staggered appearance
  useEffect(() => {
    const itemCount = suggestions.length;
    const showNextItem = (index: number) => {
      if (index < itemCount) {
        setVisibleItems(prev => [...prev, index]);
        setTimeout(() => showNextItem(index + 1), 100);
      }
    };
    
    showNextItem(0);
    
    return () => setVisibleItems([]);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-6xl mx-auto">
      {suggestions.map((suggestion, index) => (
        <div 
          key={index}
          className={cn(
            "transition-all duration-300 transform",
            visibleItems.includes(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={{ transitionDelay: `${index * 100}ms` }}
        >
          <Card 
            className={cn(
              "border cursor-pointer transition-all duration-200",
              "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-700",
              "dark:bg-gray-800/60 group",
              suggestion.color
            )}
            onClick={() => onQueryClick(suggestion.question)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="mt-1 flex-shrink-0">
                  {suggestion.icon}
                </div>
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {suggestion.question}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {suggestion.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default SuggestedQueries;
