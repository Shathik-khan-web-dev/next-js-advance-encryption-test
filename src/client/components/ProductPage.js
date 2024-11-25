"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { _get, _post, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { addToCart } from "@/client/store/nextSlice";
import { Modal, ModalTrigger } from "@/client/components/ui/animated-modal";
import {
  AiOutlineHeart,
  AiFillHeart,
  AiFillStar,
  AiOutlineStar,
} from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";

export default function ProductPage({
  selectedCategory,
  selectedPriceRange,
  selectedProductCategory,
}) {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Scroll to top when the selected category, price range, or page changes
  useEffect(() => {
    window.scrollTo(0, 0); // Scroll to top
  }, [currentPage, selectedCategory, selectedPriceRange]);

  // Shuffle array function
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Function to build the URL dynamically for category and price range
  const buildCategoryAndPriceRangeUrl = () => {
    let url = `/api/products?controllerName=getProductsByCategoryAndPriceRange&category=${selectedCategory}`;

    if (selectedPriceRange) {
      const [minPrice, maxPrice] = selectedPriceRange.split("-");
      url += `&minPrice=${minPrice}&maxPrice=${maxPrice}`;
    }

    url += `&page=${currentPage}&pageSize=20`;
    return url;
  };
  // selectedProductCategory and price range
  const selectedProductCategoryAndPriceRange = () => {
    let url = `/api/products?controllerName=getProductsByCategoryAndPriceRange&category=${selectedProductCategory}`;

    if (selectedPriceRange) {
      const [minPrice, maxPrice] = selectedPriceRange.split("-");
      url += `&minPrice=${minPrice}&maxPrice=${maxPrice}`;
    }

    url += `&page=${currentPage}&pageSize=20`;
    return url;
  };

  //  all products in the category
  const buildAllProductsUrl = () => {
    let url = `/api/products?controllerName=getAllProductsFilter&page=${currentPage}`;

    if (selectedProductCategory && selectedProductCategory !== "all-products") {
      url += `&category=${selectedProductCategory}`;
    }

    if (selectedPriceRange) {
      const [minPrice, maxPrice] = selectedPriceRange.split("-");
      url += `&minPrice=${minPrice}&maxPrice=${maxPrice}`;
    }

    return url;
  };

  useEffect(() => {
    async function fetchProducts() {
      try {
        let url;

        if (selectedProductCategory === "all-products") {
          url = buildAllProductsUrl();
        } else if (selectedProductCategory) {
          url = selectedProductCategoryAndPriceRange();
        } else if (selectedCategory) {
          url = buildCategoryAndPriceRangeUrl();
        }

        const apiResponse = await _get(url);

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const { products, totalPages } = response;

        const productsToSet = Array.isArray(products) ? products : [];
        if (selectedProductCategory === "all-products") {
          setProducts(shuffleArray(productsToSet));
        } else {
          setProducts(productsToSet);
        }
        setTotalPages(totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }

    fetchProducts();
  }, [
    selectedCategory,
    selectedPriceRange,
    selectedProductCategory,
    currentPage,
  ]);

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  const handleAddToCart = async (product) => {
    if (!session) {
      router.push("/auth");
    } else {
      try {
        const apiResponse = await _post(`/api/products/cart`, {
          controllerName: "addProductToCart",
          productId: product.productId,
          imageUrl: product.imageUrl,
          category: product.category,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          description: product.description,
          quantity: 1,
          email: session.user?.email,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        if (apiResponse.status === 200) {
          const { alreadyAdded } = response;
          dispatch(addToCart(product));

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

  useEffect(() => {
    const handleGetFavorite = async () => {
      if (session && session.user) {
        // Ensure session and user exist before making the API call
        try {
          const apiResponse = await _get(`/api/visitor`, {
            controllerName: "getFavorite",
            email: session.user.email,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          // Store the favorite product IDs in state
          const favoriteProducts = response.favorite.map(
            (item) => item.productId
          );
          setFavorites(favoriteProducts);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "An error occurred while fetching the favorites"
          );
        }
      }
    };

    handleGetFavorite();
  }, [session]); // session is the dependency

  const handleFavoriteBtn = async (product) => {
    if (!session) {
      router.push("/auth");
    } else {
      try {
        const email = session.user?.email;

        if (favorites.includes(product.productId)) {
          // Remove from favorites
          const apiResponse = await _delete(`/api/visitor`, {
            controllerName: "removeProductFromFavorite",
            email: email,
            productId: product.productId,
          }); 

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          if (apiResponse.status === 200) {
            setFavorites((prevFavorites) =>
              prevFavorites.filter((favId) => favId !== product.productId)
            );
            toast.success(`${product.name} removed from favorites`);
          } else {
            toast.error("Failed to remove product from favorites");
          }
        } else {
          // Add to favorites
          const apiResponse = await _post("/api/visitor", {
            controllerName: "addProductToFavorite",
            productId: product.productId,
            imageUrl: product.imageUrl,
            category: product.category,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            description: product.description,
            email: email,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          if (apiResponse.status === 200) {
            const { alreadyAdded } = response;

            if (alreadyAdded) {
              toast.error(`${product.name} is already in your favorites`);
            } else {
              setFavorites((prevFavorites) => [
                ...prevFavorites,
                product.productId,
              ]);
              toast.success(`${product.name} added to favorites`);
            }
          } else {
            toast.error("Failed to add product to favorites");
          }
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while adding/removing favorites"
        );
      }
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto w-full sm:w-[1000px] md:mt-6">
      <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-5 md:gap-7">
        {products.length > 0 ? (
          products.map((product) => (
            <div
              className="relative rounded-md overflow-hidden shadow-md top-shadow shadow-[#ffc107ff] dark:shadow-dark-lg 
      dark:hover:shadow-dark-xl duration-300"
              key={product._id}>
              <Link
                href={{
                  pathname: "/product-category",
                  query: { p: encryptId(product.productId) },
                }}>
                <Image
                  src={product.imageUrl}
                  className="w-full h-42 object-cover hover:scale-105 transition-transform duration-300"
                  width={100}
                  height={100}
                  alt="product image"
                  draggable={false}
                  loading="lazy"
                />
              </Link>

              {/* Heart button */}
              <button
                onClick={() => handleFavoriteBtn(product)}
                className="absolute top-2 right-2 text-4xl text-red-500">
                {favorites.includes(product.productId) ? (
                  <AiFillHeart />
                ) : (
                  <AiOutlineHeart />
                )}
              </button>

              <div className="px-4 py-4 flex flex-col gap-2">
                <p className="text-gray-900 font-medium dark:text-[#e8126aff]">
                  {product.name}
                </p>

                <div className="flex gap-2">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    ₹ {product.price}
                  </p>
                  <p className="font-semibold text-gray-800 dark:text-gray-500">
                    <del>₹ {product.oldPrice}</del>
                  </p>
                </div>

                {/* Star Rating */}
                {product.ratingsCount > 0 && (
                  <div className="flex gap-1 items-center">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => {
                        return i < product.rating ? (
                          <AiFillStar key={i} className="text-yellow-400" />
                        ) : (
                          <AiOutlineStar key={i} className="text-yellow-400" />
                        );
                      })}
                    <span className="ml-2 text-gray-600">
                      ({product.ratingsCount})
                    </span>
                  </div>
                )}
                {/*  
                  Star Rating     
              <div className="flex gap-1 items-center">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => {
                      return i < product.rating ? (
                        <AiFillStar key={i} className="text-yellow-400" />
                      ) : (
                        <AiOutlineStar key={i} className="text-yellow-400" />
                      );
                    })}
                  <span className="ml-2 text-gray-600">
                    ({product.ratingsCount})
                  </span>
                </div> */}

                <p className="md:line-clamp-2 line-clamp-3 text-sm">
                  {product.description}
                </p>

                <div className="flex items-center justify-between">
                  <Modal>
                    <ModalTrigger
                      className="relative bg-black dark:bg-black dark:text-white border border-transparent dark:border-[#e8126aff]
                      dark:hover:border-[#ffc107ff]
              text-white flex justify-center items-center group/modal-btn h-10 w-48 rounded-md transition duration-500
               hover:bg-[#ffc107ff] dark:hover:bg-[#ffc107ff]
              hover:shadow-lg active:scale-95">
                      <span className="group-hover/modal-btn:translate-x-40 text-center transition duration-500 text-sm">
                        Add to Cart
                      </span>
                      <div
                        className="-translate-x-40 group-hover/modal-btn:translate-x-0 flex items-center
                justify-center absolute inset-0 transition duration-500 text-white dark:text-black z-20"
                        onClick={() => handleAddToCart(product)}>
                        🛒 Add to Cart
                      </div>
                    </ModalTrigger>
                  </Modal>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>No products available in this category.</p>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-evenly items-center mt-14">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} // Go to previous page
          disabled={currentPage === 1}
          className="mx-2 px-4 py-2 bg-[#e8126aff] dark:bg-black border border-[#e8126aff] text-white rounded">
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          } // Go to next page
          disabled={currentPage === totalPages}
          className="mx-2 px-4 py-2 bg-[#e8126aff] dark:bg-black border border-[#e8126aff] text-white rounded">
          Next
        </button>
      </div>

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
}
