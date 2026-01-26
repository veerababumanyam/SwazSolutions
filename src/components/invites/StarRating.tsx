/**
 * Star Rating Component
 * Interactive star rating for templates
 */

import { useState } from 'react';

interface StarRatingProps {
  rating?: number;
  count?: number;
  readonly?: boolean;
  onRate?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
}

export function StarRating({
  rating = 0,
  count,
  readonly = false,
  onRate,
  size = 'md',
  showValue = true
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleMouseEnter = (index: number) => {
    if (readonly) return;
    setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (readonly) return;
    setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (readonly || !onRate) return;

    const newRating = index === rating ? rating : index;
    setIsAnimating(true);
    onRate(newRating);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const renderStars = () => {
    const stars = [];
    const displayRating = hoverRating || rating;

    for (let i = 1; i <= 5; i++) {
      const fillPercentage = i <= displayRating ? 100 : i - 0.5 === displayRating ? 50 : 0;

      stars.push(
        <button
          key={i}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={() => handleClick(i)}
          disabled={readonly}
          className={`relative ${sizeClasses[size]} ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
          aria-label={`Rate ${i} stars`}
        >
          {/* Empty star (background) */}
          <svg
            className="absolute inset-0 text-gray-300 dark:text-gray-600"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>

          {/* Filled star (foreground with clip) */}
          <svg
            className="absolute inset-0 text-yellow-400 transition-all duration-300"
            style={{
              clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`
            }}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      );
    }

    return stars;
  };

  return (
    <div className={`flex items-center gap-2 ${isAnimating ? 'scale-110 transition-transform' : ''}`}>
      <div className="flex items-center gap-1">
        {renderStars()}
      </div>
      {showValue && (
        <div className="flex items-center gap-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {rating.toFixed(1)}
          </span>
          {count !== undefined && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ({count})
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Compact version for inline use
export function StarRatingCompact({
  rating,
  readonly = true
}: {
  rating: number;
  readonly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
