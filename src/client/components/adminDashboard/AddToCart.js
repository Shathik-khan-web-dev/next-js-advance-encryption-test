"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import CryptoJS from "crypto-js";
import config from "@/config";
import { _get, _put, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { addToCart, removeProduct } from "@/client/store/nextSlice";
import toast, { Toaster } from "react-hot-toast";

export default function Cart() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch cart items from the database and store to redux
  const fetchCart = useCallback(async () => {
    if (!session?.user?.email) {
      setIsLoading(false);
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
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.email]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchCart();
    }
  }, [fetchCart, session?.user?.email]);

  const handleRemoveProduct = async (event, productId) => {
    event.preventDefault();

    try {
      const apiResponse = await _delete(`/api/visitor`, {
        controllerName: "removeProductFromCart",
        email: session.user.email,
        productId: productId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      const updatedCartItems = cartItems.filter(
        (item) => item.productId !== productId
      );

      setCartItems(updatedCartItems);

      dispatch(removeProduct(productId));

      if (apiResponse.status !== 200) {
        setCartItems(cartItems); // Revert back to the original state
      } else {
        fetchCart(); // Re-fetch cart after deletion
      }
    } catch (error) {
      setCartItems(cartItems);
    }
  };

  // Update the subtotal function to account for quantity
  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price * item.quantity || 0),
      0
    );
  };

  // Dynamic price calculation logic
  const subtotal = calculateSubtotal();
  const shipping = 60.0; // Flat shipping rate
  const tax = (subtotal * 0.08).toFixed(2); // Assuming 8% tax rate
  const orderTotal = (subtotal + shipping + parseFloat(tax)).toFixed(2);

  const encryptData = (data) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(JSON.stringify(data), secretKey).toString();
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  const handleCheckout = (event) => {
    event.preventDefault();
    // Encrypt the cart items and order total
    const encryptedProducts = encodeURIComponent(encryptData(cartItems));

    const checkoutUrl = `/dashboard/visitor/check-out?products=${encryptedProducts}`;

    router.push(checkoutUrl);
  };

  const handleQuantityChange = async (event, productId) => {
    const newQuantity = parseInt(event.target.value, 10);
    const updatedCartItems = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: newQuantity } // Only update the quantity, not the price
        : item
    );

    setCartItems(updatedCartItems);

    try {
      const apiResponse = await _put(`/api/products/cart`, {
        controllerName: "updateCartProductQuantity",
        email: session.user.email,
        productId,
        quantity: newQuantity,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        toast.success(response.message);

        fetchCart(); // Optionally refetch the cart to update the total price
      } else {
        setError("Failed to update quantity");
      }
    } catch (error) {
      setError("Error updating quantity");
    }
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div
        className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white
       dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6
        lg:max-w-7xl lg:px-8 overflow-y-auto">
        {isLoading ? (
          <div className="text-black dark:text-white text-center">
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : !cartItems.length ? (
          <div className="text-black dark:text-white text-center">
            Your Cart is empty.
          </div>
        ) : (
          <form className="lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16">
            <section aria-labelledby="cart-heading" className="lg:col-span-7">
              <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
              </h2>

              <h3 className="text-center text-xl text-black dark:text-white pb-5">
                Add to cart
              </h3>
              <ul
                role="list"
                className="divide-y divide-gray-200 border-b border-t border-gray-200">
                {cartItems.map((product, productIdx) => (
                  <li key={product._id} className="flex py-1 sm:py-3">
                    <Link
                      href={{
                        pathname: "/product-category",
                        query: { p: encryptId(product.productId) }, // Encrypt the productId
                      }}>
                      <div className="flex-shrink-0">
                        <Image
                          alt={product.name}
                          src={product.imageUrl}
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
                                {product.name}
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

                            <p
                              className={
                                product.stock
                                  ? "text-green-500"
                                  : "text-red-500 text-xs flex justify-center items-center"
                              }>
                              {product.stock ? "" : "*Out of Stock"}
                            </p>
                          </div>
                          <p>{product.description}</p>
                        </div>
                        <div className="mt-4 sm:mt-0 sm:pr-9">
                          <div className="mt-4 sm:mt-0 sm:pr-9">
                            <select
                              id={`quantity-${productIdx}`}
                              name={`quantity-${productIdx}`}
                              className="max-w-full rounded-md border border-gray-300 py-1.5 
                              text-left text-base font-medium leading-5 text-[#ffc107ff] shadow-sm
                               focus:border-[#e8126aff] focus:outline-none focus:ring-1 focus:ring-[#e8126aff] sm:text-sm"
                              value={product.quantity}
                              onChange={(e) =>
                                handleQuantityChange(e, product.productId)
                              }>
                              {[1, 2, 3, 4, 5].map((qty) => (
                                <option
                                  key={qty}
                                  value={qty}
                                  className="text-[#ffc107ff]">
                                  {qty}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="absolute right-0 top-0">
                            <button
                              type="button"
                              onClick={(event) =>
                                handleRemoveProduct(event, product.productId)
                              }
                              className="-m-2 inline-flex p-2 text-gray-400 hover:text-gray-500">
                              <span className="sr-only">Remove</span>
                              <XMarkIcon
                                aria-hidden="true"
                                className="h-5 w-5"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
            {/* Order summary */}
            <section
              aria-labelledby="summary-heading"
              className="mt-16 rounded-lg bg-gray-50 px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8">
              <h2
                id="summary-heading"
                className="text-lg font-medium text-gray-900">
                Order summary
              </h2>

              <dl className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <dt className="text-sm text-gray-600">Subtotal</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₹ {subtotal.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex items-center text-sm text-gray-600">
                    <span>Shipping estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">
                    ₹ {shipping.toFixed(2)}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="flex text-sm text-gray-600">
                    <span>Tax estimate</span>
                    <a
                      href="#"
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-500">
                      <QuestionMarkCircleIcon
                        aria-hidden="true"
                        className="h-5 w-5"
                      />
                    </a>
                  </dt>
                  <dd className="text-sm font-medium text-gray-900">₹ {tax}</dd>
                </div>
                <div className="flex items-center justify-between border-t border-gray-200 pt-4">
                  <dt className="text-base font-medium text-gray-900">
                    Order total
                  </dt>
                  <dd className="text-base font-medium text-gray-900">
                    ₹ {orderTotal}
                  </dd>
                </div>
              </dl>

              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-md border border-transparent bg-[#ffc107ff] px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-[#e8126aff] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50">
                  Confirm order
                </button>
              </div>
            </section>
          </form>
        )}
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
