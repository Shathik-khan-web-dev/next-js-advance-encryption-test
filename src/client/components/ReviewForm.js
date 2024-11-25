"use client";

import { useState } from "react";

const ReviewForm = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submitReview = async () => {
    const response = await fetch("/api/reviewRoutes?action=addReview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        userId: "someUserId",
        rating,
        comment,
      }),
    });

    if (response.ok) {
      alert("Review submitted successfully");
    } else {
      alert("Error submitting review");
    }
  };

  return (
    <div>
      <h3>Write a Review</h3>
      <label>Rating:</label>
      <input
        type="number"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
        min="1"
        max="5"
      />
      <label>Comment:</label>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} />
      <button onClick={submitReview}>Submit Review</button>
    </div>
  );
};

export default ReviewForm;
