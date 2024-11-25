"use client";

import { useState, useEffect, useCallback } from "react";
import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { addToCart } from "@/client/store/nextSlice";

export default function Dashboard() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  // Fetch cart items from the database and store to redux
  const fetchCart = useCallback(async () => {
    if (!session?.user?.email) {
      return;
    }
    try {
      const apiResponse = await _get(`/api/products/cart`, {
        controllerName: "getCart",
        email: session.user.email,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        const cartProducts = response.cart;
        setCartItems(response.cart);
        setError(null);
        cartProducts.forEach((product) => {
          dispatch(addToCart(product));
        });
      } else {
        setError("Failed to fetch cart");
      }
    } catch (error) {
      setError("Error fetching cart");
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchCart();
    }
  }, [fetchCart, session?.user?.email]);

  return (
    <div className="flex flex-1">
      <div
        className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700
   bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full">
        <h2 className="text-2xl font-semibold text-black dark:text-white">
          Admin Dashboard
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          This is your profile section.
        </p>
      </div>
    </div>
  );
}
