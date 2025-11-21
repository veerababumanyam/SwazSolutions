import React, { useState } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { FeedbackEntry, FeedbackRating, saveFeedback, getFeedbackForMessage } from "../utils/feedback";
import "../index.css";

interface FeedbackButtonsProps {
    messageId: string;
    userRequest: string;
    agentResponse: string;
    generationSettings?: any;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
    messageId,
    userRequest,
    agentResponse,
    generationSettings
}) => {
    const existingFeedback = getFeedbackForMessage(messageId);
    const [rating, setRating] = useState<FeedbackRating | null>(existingFeedback?.rating || null);
    const [showCommentInput, setShowCommentInput] = useState(false);
    const [comment, setComment] = useState(existingFeedback?.comment || "");
    const [submitted, setSubmitted] = useState(!!existingFeedback);

    const handleRating = (newRating: FeedbackRating) => {
        setRating(newRating);

        if (newRating === "thumbs_down") {
            setShowCommentInput(true);
        } else {
            // Auto-submit positive feedback
            submitFeedback(newRating, "");
        }
    };

    const submitFeedback = (feedbackRating: FeedbackRating, feedbackComment: string) => {
        const entry: FeedbackEntry = {
            id: `${messageId}-${Date.now()}`,
            messageId,
            rating: feedbackRating,
            comment: feedbackComment || undefined,
            timestamp: Date.now(),
            context: {
                userRequest,
                agentResponse,
                generationSettings
            }
        };

        saveFeedback(entry);
        setSubmitted(true);
        setShowCommentInput(false);
    };

    const handleCommentSubmit = () => {
        if (rating) {
            submitFeedback(rating, comment);
        }
    };

    return (
        <div className="feedback-container">
            <div className="feedback-buttons">
                <button
                    onClick={() => handleRating("thumbs_up")}
                    className={`feedback-btn ${rating === "thumbs_up" ? "active positive" : ""}`}
                    disabled={submitted}
                    title="This response was helpful"
                >
                    <ThumbsUp size={16} />
                </button>

                <button
                    onClick={() => handleRating("thumbs_down")}
                    className={`feedback-btn ${rating === "thumbs_down" ? "active negative" : ""}`}
                    disabled={submitted}
                    title="This response needs improvement"
                >
                    <ThumbsDown size={16} />
                </button>
            </div>

            {showCommentInput && !submitted && (
                <div className="feedback-comment-box">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="What could be improved? (e.g., rhyme scheme, script mixing, mood mismatch)"
                        className="feedback-textarea"
                        rows={3}
                    />
                    <button onClick={handleCommentSubmit} className="feedback-submit-btn">
                        Submit Feedback
                    </button>
                </div>
            )}

            {submitted && (
                <span className="feedback-thanks">Thanks for your feedback! 🙏</span>
            )}
        </div>
    );
};

// CSS classes to add to index.css
/*
.feedback-container {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.feedback-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.feedback-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.feedback-btn:hover:not(:disabled) {
  background: var(--hover);
  transform: translateY(-1px);
}

.feedback-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feedback-btn.active.positive {
  background: rgba(34, 197, 94, 0.1);
  border-color: #22c55e;
  color: #22c55e;
}

.feedback-btn.active.negative {
  background: rgba(239, 68, 68, 0.1);
  border-color: #ef4444;
  color: #ef4444;
}

.feedback-comment-box {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.feedback-textarea {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.6rem;
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
}

.feedback-textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.feedback-submit-btn {
  align-self: flex-end;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.feedback-submit-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.feedback-thanks {
  font-size: 0.875rem;
  color: var(--accent);
  font-weight: 500;
}
*/
