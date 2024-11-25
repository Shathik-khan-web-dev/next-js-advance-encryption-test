import React, { useState, useEffect } from "react";
import Image from "next/image";

const ProductImageZoom = ({ product }) => {
  const [lensPosition, setLensPosition] = useState({ left: 0, top: 0 });
  const [backgroundPosition, setBackgroundPosition] = useState("0px 0px");
  const [isLensVisible, setIsLensVisible] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [lensSize, setLensSize] = useState({ width: 100, height: 100 });
  const [zoomLevel, setZoomLevel] = useState(600); // Adjust zoom level

  // Function to detect window size and update isLargeScreen
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 640);
    };

    // Initial check on mount
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!isLargeScreen) return; // Disable zoom on small screens

    const imageContainer = e.target.getBoundingClientRect();
    const x = e.clientX - imageContainer.left;
    const y = e.clientY - imageContainer.top;

    const lensX = Math.max(0, Math.min(x, imageContainer.width));
    const lensY = Math.max(0, Math.min(y, imageContainer.height));

    setLensPosition({
      left: lensX,
      top: lensY,
    });

    const bgPosX = (lensX / imageContainer.width) * 100;
    const bgPosY = (lensY / imageContainer.height) * 100;

    setBackgroundPosition(`${bgPosX}% ${bgPosY}%`);

    // Adjust lens size relative to mouse position
    const dynamicWidth = Math.min(150, imageContainer.width - lensX);
    const dynamicHeight = Math.min(150, imageContainer.height - lensY);

    setLensSize({ width: dynamicWidth, height: dynamicHeight });

    setIsLensVisible(true);
  };

  const handleMouseOut = () => {
    setIsLensVisible(false);
  };

  return (
    <div className="relative w-full">
      {/* Product Image */}
      <div
        className="w-full sm:w-96 h-96 relative overflow-hidden flex justify-center items-center mx-auto"
        onMouseMove={isLargeScreen ? handleMouseMove : null}
        onMouseOut={isLargeScreen ? handleMouseOut : null}>
        <Image
          alt="Product Image"
          src={product.imageUrl}
          className="object-cover object-center rounded-lg w-full h-full"
          layout="fill"
          draggable={false}
        />

        {/* Lens for zoom effect - only show on large screens */}
        {isLargeScreen && isLensVisible && (
          <span
            className="lens"
            style={{
              left: lensPosition.left,
              top: lensPosition.top,
              position: "absolute",
              width: `100px`,
              height: `100px`,
              backgroundColor: "rgba(0, 0, 0, 0.3)",
              border: "2px solid #ffc107ff",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}></span>
        )}
      </div>

      {/* Zoomed Image - only show on large screens */}
      {isLargeScreen && (
        <div
          className="zoom-image-zoomed z-10 hidden sm:block absolute top-0 left-[calc(100%+20px)] w-full sm:w-96 h-96"
          style={{
            backgroundImage: `url(${product.imageUrl})`,
            backgroundSize: `${zoomLevel}% ${zoomLevel}%`, // Zoom level adjustment
            backgroundPosition: backgroundPosition,
            display: isLensVisible ? "block" : "none",
          }}></div>
      )}
    </div>
  );
};

export default ProductImageZoom;
