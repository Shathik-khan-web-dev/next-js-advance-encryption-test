"use client";

import React from "react";
import Image from "next/image";
import "./homeComponents.css";
import toast, { Toaster } from "react-hot-toast";

const review = () => {
  const happyCustomers = [
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_29-1.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_15.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_28.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_30.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_07.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_17.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_26-1.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_21.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_20.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_03.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_35.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_23.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_16.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_15.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_13.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_08.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_06.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_14.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_09.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_19.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_31.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_18.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_05.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_37.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_36.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_38.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_34-1.jpg",
    "https://www.yourprint.in/wp-content/uploads/2023/09/review_hp_39.jpg",
  ];

  const handleImageClick = () => {
    toast.error(" Check 🔥Trending");
  };

  return (
    <div
      className="flex flex-col sm:flex-row md:flex-row shadow-lg justify-center mx-auto
      top-shadow shadow-gray-700 rounded-lg my-9 ">
      <div className="p-2 pb-2 mt-12 flex-1 justify-center items-center ">
        <h5 className="text-center pb-2 font-semibold">What is yourPrint?</h5>
        <h4 className="text-center pb-2  font-bold">
          The Everything Store for Customized Items
        </h4>

        <div className="flex flex-col justify-center items-center">
          <ul className="list-disc">
            <li>Largest Range of Customized Products & Gifts</li>
            <li>Printing High Quality Products since 2024</li>
          </ul>
        </div>
        <div className="flex justify-center gap-3 pt-5">
          <div>
            <div className="text-center">
              <h5 className=" font-bold">10 Lac +</h5>
              <p className=" text-slate-300">Happy Customers</p>
            </div>
            <div className="text-center">
              <h5 className=" font-bold">1,000 +</h5>
              <p className=" text-slate-300">5-Star Ratings</p>
            </div>
          </div>
          <div>
            <div className="text-center">
              <h5 className=" font-bold">25 Lac +</h5>
              <p className=" text-slate-300">Products Delivered</p>
            </div>
            <div className="text-center">
              <h5 className=" font-bold">2,00,000 +</h5>
              <p className=" text-slate-300">Customized Products</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-2 pb-2 w-full sm:w-1/2 ">
        <h5 className="text-center pb-2 font-bold">Happy Customers</h5>
        <div id="review-images-wrapper" className="overflow-auto">
          <div id="review-images-section" className="flex space-x-2">
            {happyCustomers.map((src, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="relative cursor-pointer">
                  <Image
                    decoding="async"
                    height={100}
                    width={100}
                    src={`https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=${src}&width=200&cfcache=all`}
                    loading="lazy"
                    alt="Happy Customer"
                    className="object-cover"
                    onClick={handleImageClick}
                  />
                </div>
                {/*   <div className="relative cursor-pointer">
                  <Image
                    decoding="async"
                    height={100}
                    width={100}
                    src={`https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=${src}&width=200&cfcache=all`}
                    loading="lazy"
                    alt="Happy Customer"
                    className="object-cover"
                  />
                </div> */}
              </div>
            ))}
          </div>
        </div>
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

export default review;
