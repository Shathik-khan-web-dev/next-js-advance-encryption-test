"use client";
import { useState } from "react";

const UpdateReviewModal = ({ review, isOpen, onClose, onSubmit }) => {
  const [updatedReviewText, setUpdatedReviewText] = useState(review.reviewText);
  const [updatedRating, setUpdatedRating] = useState(review.rating);

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit({
      ...review,
      reviewText: updatedReviewText,
      rating: updatedRating,
    });
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-100"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-neutral-800 rounded-lg p-4 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold">Update Review</h2>

        <textarea
          value={updatedReviewText}
          onChange={(e) => setUpdatedReviewText(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded mt-2"
          rows={4}
        />

        <input
          type="number"
          value={updatedRating}
          onChange={(e) => setUpdatedRating(e.target.value)}
          min={1}
          max={5}
          className="w-full p-2 border border-gray-300 rounded mt-2"
          placeholder="Rating (1-5)"
        />

        <button
          onClick={handleSubmit}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
          Submit
        </button>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded ml-2">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default UpdateReviewModal;
