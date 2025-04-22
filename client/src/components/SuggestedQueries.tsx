import { Card, CardContent } from "@/components/ui/card";

interface SuggestedQueriesProps {
  onQueryClick: (query: string) => void;
}

const SuggestedQueries = ({ onQueryClick }: SuggestedQueriesProps) => {
  const suggestions = [
    {
      question: "Hi, what is the weather",
      description: "Get immediate AI generated response"
    },
    {
      question: "Hi, what is my location",
      description: "Get immediate AI generated response"
    },
    {
      question: "Hi, what is the temperature",
      description: "Get immediate AI generated response"
    },
    {
      question: "Hi, how are you",
      description: "Get immediate AI generated response"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
      {suggestions.map((suggestion, index) => (
        <Card 
          key={index}
          className="bg-white cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onQueryClick(suggestion.question)}
        >
          <CardContent className="p-4">
            <h3 className="font-medium text-foreground">{suggestion.question}</h3>
            <p className="text-sm text-gray-500">{suggestion.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SuggestedQueries;
