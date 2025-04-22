import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StarRating from "@/components/StarRating";

interface FeedbackFormProps {
  onSubmit: (rating: number, feedback: string) => void;
}

const FeedbackForm = ({ onSubmit }: FeedbackFormProps) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  const handleSubmit = () => {
    onSubmit(rating, feedback);
  };

  return (
    <div className="bg-white rounded-lg p-6 max-w-2xl mx-auto mb-6 shadow-md">
      <h3 className="text-xl font-bold mb-4 text-center">How was your experience?</h3>
      
      <div className="mb-6">
        <p className="text-sm font-medium mb-2">Rate this conversation:</p>
        <div className="flex justify-center space-x-2">
          <StarRating rating={rating} onRatingChange={setRating} />
        </div>
      </div>
      
      <div className="mb-6">
        <label htmlFor="feedbackText" className="block text-sm font-medium mb-2">
          Additional feedback:
        </label>
        <Textarea
          id="feedbackText"
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="Share your thoughts about this conversation..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </div>
      
      <div className="flex justify-end">
        <Button
          id="submitFeedback"
          className="bg-primary hover:bg-opacity-90 text-white px-6 py-2 rounded-md"
          onClick={handleSubmit}
          disabled={rating === 0}
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default FeedbackForm;
