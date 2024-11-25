"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { addToCart } from "@/client/store/nextSlice";
import "react-toastify/dist/ReactToastify.css";
import { useDispatch } from "react-redux";
import toast, { Toaster } from "react-hot-toast";

const Trending = () => {
  const [customerLikeProduct, setCustomerLikeProduct] = useState([]);
  const { data: session } = useSession();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleCategoryClick = (category) => {
    router.push(`/products?category=${category}`);
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = `/api/products?controllerName=getRandomProducts`;

        const response = await axios.get(url);
        setCustomerLikeProduct(response.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "180px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerPadding: "100px",
        },
      },
      {
        breakpoint: 768, // For mobile devices
        settings: {
          slidesToShow: 1,
          centerPadding: "50px",
        },
      },
    ],
  };

  const handleAddToCart = async (product) => {
    dispatch(addToCart(product)); // Redux action to add to cart

    if (!session) {
      router.push("/auth");
    } else {
      try {
        const email = session.user?.email;

        const response = await axios.post("/api/products/cart", {
          productId: product._id,
          imageUrl: product.imageUrl,
          category: product.category,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          description: product.description,
          quantity: 1,
          email: email,
        });

        if (response.status === 200) {
          const { alreadyAdded } = response.data;

          if (alreadyAdded) {
            toast.error(`${product.name} is already in the cart`);
          } else {
            toast.success(`${product.name} added to cart`);
          }
        } else {
          toast.error("Failed to add product to cart");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while adding to cart"
        );
      }
    }
  };

  return (
    <div className="mt-10">
      <h1 className="py-5">Review's</h1>
      <Slider {...settings}>
        {customerLikeProduct.map((product) => (
          <div
            key={product._id}
            className="flex flex-col w-64 overflow-x-hidden"
            onClick={() => handleCategoryClick("men-tshirt")}>
            <div className="relative w-64 m-10">
              <div className="relative h-48 overflow-hidden rounded-lg">
                <Image
                  src={product.imageUrl}
                  className="w-full h-42 object-cover hover:scale-105 transition-transform duration-300"
                  width={100}
                  height={100}
                  alt="product image"
                  draggable={false}
                  loading="lazy"
                />
              </div>
              <div className="relative mt-2">
                <h3 className="text-sm font-medium text-black dark:text-white">
                  ₹ {product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  <del>₹ {product.oldPrice}</del>
                </p>
                <h3 className="text-sm font-medium text-black dark:text-white">
                  {product.description}
                </h3>
              </div>
              <div className="absolute inset-x-0 top-0 flex h-48 items-end justify-end overflow-hidden rounded-lg p-4">
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black opacity-50" />
                <p className="relative text-md font-semibold text-black dark:text-white bg-slate-400 rounded-lg px-1">
                  ₹ {product.price}
                </p>
              </div>
              <div className="m-8">
                <a
                  href={product.href}
                  className="relative flex items-center justify-center rounded-md border border-transparent bg-[#ffc107ff] px-4 py-2 text-sm font-semibold hover:bg-[#e8126aff] text-white"
                  onClick={() => handleAddToCart(product)}>
                  Add to Cart
                  <span className="sr-only">, {product.name}</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </Slider>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default Trending;
