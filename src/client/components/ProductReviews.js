"use client"
import { useEffect, useState } from "react";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const response = await fetch(
        `/api/reviewRoutes?action=getReviewsByProduct&productId=${productId}`
      );
      const data = await response.json();
      setReviews(data.reviews);
    };

    fetchReviews();
  }, [productId]);

  return (
    <div>
      <h3>Customer Reviews</h3>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <div key={review.id}>
            <p>Rating: {review.rating}</p>
            <p>{review.comment}</p>
            <small>
              Reviewed on {new Date(review.createdAt).toLocaleDateString()}
            </small>
          </div>
        ))
      ) : (
        <p>No reviews yet. Be the first to review this product!</p>
      )}
    </div>
  );
};

export default ProductReviews;
