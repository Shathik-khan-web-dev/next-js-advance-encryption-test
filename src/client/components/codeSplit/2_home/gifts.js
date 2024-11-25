"use client";

import React from "react";
import Image from "next/image";
import "./homeComponents.css";
import toast, { Toaster } from "react-hot-toast";

const Gifts = () => {
  const giftsImages = [
    "https://www.yourprint.in/wp-content/uploads/2024/05/happy-birthday-banner.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/Anniversary-banner.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/mothers-day-Banner.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/For-him.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/For-Her.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/For-Kids.jpg",
    "https://www.yourprint.in/wp-content/uploads/2024/05/Gift-Box-1.jpg",
  ];

  const giftsLabels = [
    "Birthday Gifts",
    "Anniversary Gifts",
    "Mother's Day Gifts",
    "For Him",
    "For Her",
    "For Kids",
    "All Gifts",
  ];

  const handleImageClick = () => {
    toast.error(" Check 🔥Trending");
  };

  return (
    <div className="mx-auto  shadow-lg top-shadow shadow-gray-700 rounded-lg my-9 ">
      <div className="text-center py-3">
        <h5 className="text-lg font-semibold">
          <span>🎁 Personalized Gifts</span>
        </h5>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-5 mx-4 pb-3">
        {giftsImages.map((src, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="box">
              <Image
                src={src}
                alt={`Personalized gift ${index + 1}`}
                className="all_categories_img  rounded-lg"
                width={350}
                height={300}
                sizes="(max-width: 600px) 100vw, 50vw"
                priority
                onClick={handleImageClick}
              />
              <p>{giftsLabels[index]}</p>
            </div>
          </div>
        ))}
      </div>

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            top: "100px",
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default Gifts;
