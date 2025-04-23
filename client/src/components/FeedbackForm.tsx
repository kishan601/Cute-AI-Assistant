import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";
import { MoveRight, ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  onSubmit: (rating: number, feedback: string) => void;
}

const FeedbackForm = ({ onSubmit }: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [canSubmit, setCanSubmit] = useState(false);
  const [step, setStep] = useState(1);
  
  // Enable/disable submit button based on form validation
  useEffect(() => {
    setCanSubmit(rating > 0 && (rating <= 3 ? feedback.trim().length >= 10 : true));
  }, [rating, feedback]);
  
  // Show second step when rating is selected
  useEffect(() => {
    if (rating > 0 && step === 1) {
      setTimeout(() => setStep(2), 500);
    }
  }, [rating, step]);

  const handleSubmit = () => {
    if (canSubmit) {
      onSubmit(rating, feedback);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl mx-auto shadow-md border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          Your Feedback Matters
        </h3>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
          <span>Step {step} of 2</span>
          <div className="w-16 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full ml-2 overflow-hidden">
            <div 
              className="h-full bg-indigo-500 rounded-full transition-all duration-300" 
              style={{ width: `${step * 50}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-500 transform",
        step === 1 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 absolute pointer-events-none"
      )}>
        <div className="mb-8">
          <p className="text-sm font-medium mb-4 text-gray-600 dark:text-gray-300 text-center">
            How would you rate your conversation?
          </p>
          <div className="flex justify-center">
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
        </div>
      </div>
      
      <div className={cn(
        "transition-all duration-500 transform",
        step === 2 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute pointer-events-none"
      )}>
        <div className="mb-6">
          <label htmlFor="feedbackText" className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {rating <= 3 ? 
              "What could we improve?" : 
              "What did you like about this conversation?"}
          </label>
          <Textarea
            id="feedbackText"
            rows={4}
            className={cn(
              "w-full px-3 py-2 border rounded-md transition-all duration-200",
              "focus:ring-2 focus:ring-offset-1 focus:outline-none",
              "dark:bg-gray-800/60 dark:text-gray-100",
              rating <= 3 
                ? "border-amber-200 dark:border-amber-800 focus:ring-amber-500" 
                : "border-green-200 dark:border-green-800 focus:ring-green-500"
            )}
            placeholder={rating <= 3 
              ? "Please tell us what we could do better..." 
              : "We'd love to hear your thoughts..."}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
          
          {rating <= 3 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Please provide at least 10 characters of feedback
            </p>
          )}
        </div>
        
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="text-gray-600 dark:text-gray-300"
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          
          <Button
            id="submitFeedback"
            className={cn(
              "transition-all duration-200",
              "px-6 py-2 rounded-md flex items-center", 
              canSubmit 
                ? "bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-600" 
                : "bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed"
            )}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            <span>Submit Feedback</span>
            {canSubmit && <MoveRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
