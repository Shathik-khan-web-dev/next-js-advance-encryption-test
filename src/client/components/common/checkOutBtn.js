"use client";
import { useState } from "react";
import "./Button.css"; // Make sure to import the CSS file

const Button = () => {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleOrderClick = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
      }, 10000); // Matches the animation duration in CSS
    }
  };

  return (
    <button
      className={`checkOut ${isAnimating ? "animate" : ""}`}
      onClick={handleOrderClick}>
      <span className="default">Order Now</span>
      <span className="success">
        Order Successfully
        <svg viewBox="0 0 12 10">
          <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
        </svg>
      </span>
      <div className="box"></div>
      <div className="truck">
        <div className="back"></div>
        <div className="front">
          <div className="window"></div>
        </div>
        <div className="light top"></div>
        <div className="light bottom"></div>
      </div>
      <div className="lines"></div>
    </button>
  );
};

export default Button;
