"use client";

import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import CryptoJS from "crypto-js";
import Image from "next/image";
import config from "@/config";
import { _get, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { XMarkIcon } from "@heroicons/react/20/solid";
import { useSession } from "next-auth/react";
import toast, { Toaster } from "react-hot-toast";

export default function Cart() {
  const { data: session } = useSession();
  const [favoriteItems, setFavoriteItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!session?.user?.email) {
      setIsLoading(false);
      return;
    }

    try {
      const apiResponse = await _get(`/api/visitor`, {
        controllerName: "getFavorite",
        email: session.user.email,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        setFavoriteItems(response.favorite); // Set cart items from database
        setError(null);
      } else {
        setError("Failed to fetch favorite");
      }
    } catch (error) {
      setError("Error fetching favorite");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleRemoveProduct = async (productId) => {
    // Optimistically update the UI
    const updatedCartItems = favoriteItems.filter(
      (item) => item.productId !== productId
    );
    setFavoriteItems(updatedCartItems);

    try {
      const apiResponse = await _delete(`/api/visitor`, {
        controllerName: "removeProductFromFavorite",
        email: session.user.email,
        productId: productId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      if (apiResponse.status !== 200) {
        setFavoriteItems(favoriteItems); // Revert back to the original state
      } else {
        fetchCart();
      }
    } catch (error) {
      setFavoriteItems(favoriteItems); // Revert on error
    }
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  return (
    <div
      className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700
      bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full 
      mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8 overflow-y-auto">
      {isLoading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : !favoriteItems.length ? (
        // ) : !Array.isArray(favoriteItems) || !favoriteItems.length ? (
        <div className=" text-black dark:text-white text-center ">
          Your Favorite is empty.
        </div>
      ) : (
        <form className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
          <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
              Items in your shopping cart
            </h2>
            <h3 className="text-center text-xl text-black dark:text-white pb-5 ">
              Favorite
            </h3>

            <ul
              role="list"
              className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {favoriteItems.map((product, productIdx) => (
                <li key={product._id} className="flex py-1 sm:py-3">
                  <Link
                    href={{
                      pathname: "/product-category",
                      query: { p: encryptId(product.productId) }, // Encrypt the productId
                    }}>
                    <div className="flex-shrink-0">
                      <Image
                        alt={product.productId?.name}
                        src={product.productId?.imageUrl || product.imageUrl}
                        className="h-24 w-24 rounded-md object-cover object-center sm:h-20 sm:w-20"
                        height={100}
                        width={100}
                        quality={100}
                      />
                    </div>
                  </Link>

                  <div className="ml-4 flex flex-1 flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm">
                            <a
                              href={product.href}
                              className="font-medium text-gray-700 hover:text-gray-800">
                              {product.productId?.name || product.name}
                            </a>
                          </h3>
                        </div>
                        <div className="flex gap-2">
                          <p className="mt-1 text-sm font-medium text-black dark:text-white">
                            ₹{product.price}
                          </p>
                          <p className="mt-1 text-sm font-medium text-black dark:text-gray-500">
                            <del>₹{product.oldPrice}</del>
                          </p>
                        </div>
                        <p>{product.description}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="absolute right-0 top-0">
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveProduct(product.productId)
                            }
                            className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                            <span className="sr-only">Remove</span>
                            <XMarkIcon aria-hidden="true" className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </form>
      )}
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
