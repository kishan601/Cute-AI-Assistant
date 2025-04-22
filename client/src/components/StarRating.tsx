import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  onRatingChange: (rating: number) => void;
}

const StarRating = ({ rating, onRatingChange }: StarRatingProps) => {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={`star-button ${value <= rating ? 'star-active' : ''}`}
          onClick={() => onRatingChange(value)}
          aria-label={`Rate ${value} stars`}
        >
          <Star className={value <= rating ? "fill-yellow-400" : ""} />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
