"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const SliderComponent = () => {
  const [slidesToShow, setSlidesToShow] = useState(
    typeof window !== "undefined" && window.innerWidth <= 600 ? 1 : 2
  );

  useEffect(() => {
    const handleResize = () => {
      const newSlidesToShow = window.innerWidth <= 600 ? 1 : 2;
      if (newSlidesToShow !== slidesToShow) {
        setSlidesToShow(newSlidesToShow);
      }
    };

    window.addEventListener("resize", handleResize);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, [slidesToShow]);

  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="slider-container overflow-hidden mx-auto my-5 px-5 z-0 shadow-lg top-shadow rounded-lg">
      <Slider {...settings}>
        {[
          "https://www.yourprint.in/wp-content/uploads/2024/07/Rakhi_Plain_1.jpg",
          "https://www.yourprint.in/wp-content/uploads/2023/09/t-shirts-and-more-a.jpg",
          "https://www.yourprint.in/wp-content/uploads/2023/09/custom-stationery.jpg",
          "https://www.yourprint.in/wp-content/uploads/2023/09/mugs-and-drinkware-a.jpg",
          "https://www.yourprint.in/wp-content/uploads/2023/09/phone-cases-and-more.jpg",
          "https://www.yourprint.in/wp-content/uploads/2024/05/Express-Delivery-1-1.jpg",
        ].map((src, index) => (
          <div
            key={index}
            className="slide-item flex justify-center items-center h-72 bg-gray-200 rounded-md">
            <Image
              src={src}
              alt=""
              className="slider_img rounded-md shadow-lg w-full h-full object-cover"
              width={800}
              height={600}
              sizes="(max-width: 600px) 100vw, 50vw"
              priority
            />
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default SliderComponent;
