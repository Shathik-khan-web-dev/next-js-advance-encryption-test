"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import CryptoJS from "crypto-js";
import Image from "next/image";
import Swal from "sweetalert2";
import config from "@/config";
import { _get, _post, _put, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { cn } from "@/client/utils/cn";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import { Radio, RadioGroup } from "@headlessui/react";
import { useDispatch } from "react-redux";
import { removeProduct } from "@/client/store/nextSlice";
import {
  CheckCircleIcon,
  TrashIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/20/solid";
import toast, { Toaster } from "react-hot-toast";

const deliveryMethods = [
  {
    id: 1,
    title: "Standard",
    turnaround: "4–10 business days",
    price: "₹60.00",
  },
  {
    id: 2,
    title: "Express",
    turnaround: "2–5 business days",
    price: "₹120.00",
  },
];

export default function CheckOut() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [productIdToRemove, setProductIdToRemove] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [userData, setUserData] = useState();
  const [userPhone, setUserPhone] = useState("");
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(
    deliveryMethods[0]
  );

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    secondaryPhone: "",
    apartmentNumber: "",
    city: "",
    state: "",
    country: "India",
    streetAddress: "",
    giftWrap: false,
    giftMessage: "",
  });

  useEffect(() => {
    const fetchAddressData = async () => {
      try {
        const apiResponse = await _get(`/api/visitor`, {
          controllerName: "getAddress",
          email: session.user.email,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const address = response.address.delivery;

        setFormData({
          fullName: address.userName || "",
          phone: address.phoneNumber || "",
          secondaryPhone: address.secondaryNumber || "",
          apartmentNumber: address.apartmentNumber || "",
          city: address.city || "",
          state: address.state || "",
          country: address.country || "India",
          streetAddress: address.streetAddress || "",
          giftWrap: address.giftWrap || false,
          giftMessage: address.giftWrapMessage || "",
        });
        setUserPhone(address.phoneNumber || "");
      } catch (error) {
        throw error;
      }
    };

    if (session?.user?.email) {
      fetchAddressData();
    }
  }, [session]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      fullName: e.target.firstname.value,
      email: e.target.email.value,
      phone: e.target.phone.value,
      secondaryPhone: e.target.secondaryPhone.value,
      apartmentNumber: e.target.apartmentNumber.value,
      city: e.target.city.value,
      state: e.target.state.value,
      country: e.target.country.value,
      streetAddress: e.target.streetAddress.value,
      giftWrap: e.target.apartmentNumberCheckbox.checked,
      giftMessage: e.target.giftMessage.value,
    };

    try {
      const apiResponse = await _post(`/api/visitor`, {
        controllerName: "addAddress",
        ...formData, // Include form data
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(response.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

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
        setCartItems(response.cart);
        setError(null);
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
    fetchCart();
  }, [fetchCart]);

  // Calculate subtotal using useMemo for optimization
  const subtotal = useMemo(() => calculateSubtotal(cartItems), [cartItems]);

  // Dynamic price calculation logic
  const shipping = 60.0;
  const tax = (subtotal * 0.08).toFixed(2); // Assuming 8% tax rate
  const orderTotal = (subtotal + shipping + parseFloat(tax)).toFixed(2);

  const handleQuantityChange = async (event, productId) => {
    const newQuantity = parseInt(event.target.value, 10);
    const updatedCartItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
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
      } else {
        toast.error("Failed to update quantity");
      }
    } catch (error) {
      setError("Error updating quantity");
    }
  };

  const handleDeleteClick = (productId) => {
    setProductIdToRemove(productId);
    setShowPopup(true);
  };

  const handleConfirmDelete = async (event) => {
    event.preventDefault();

    if (!productIdToRemove) return; // Ensure there's a product to remove

    try {
      const apiResponse = await _delete(`/api/visitor`, {
        controllerName: "removeProductFromCart",
        email: session.user.email,
        productId: productIdToRemove,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      // Remove from local state first
      const updatedCartItems = cartItems.filter(
        (item) => item.productId !== productIdToRemove
      );

      setCartItems(updatedCartItems);
      dispatch(removeProduct(productIdToRemove));

      if (apiResponse.status !== 200) {
        // Revert back to the original state if deletion fails
        setCartItems(cartItems);
        setError("Failed to remove product");
      }
    } catch (error) {
      // Revert back to the original state on error
      setCartItems(cartItems);
      setError("Error removing product");
    } finally {
      setShowPopup(false);
      setProductIdToRemove(null);
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setProductIdToRemove(null);
  };

  const handleApplyCoupon = async () => {
    try {
      const apiResponse = await _post(`/api/visitor`, {
        controllerName: "applyCoupon",
        email: session.user.email,
        couponCode,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      const { message, discountAmount } = response;

      if (discountAmount) {
        const discountedTotal = (orderTotal * discountAmount).toFixed(2);
        setDiscount(discountedTotal);
        setIsCouponApplied(true);
        toast.success(`${message}`, { duration: 7000 });
      } else {
        toast.error(message);
      }
    } catch (error) {
      toast.error("There was an issue applying the coupon.");
    }
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  async function loadScript() {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      return true;
    };
    script.onerror = () => {
      return false;
    };
    window.document.body.appendChild(script);
  }

  let displayRazorpay = async () => {
    let isLoaded = await loadScript();
    if (isLoaded === false) {
      alert("SDK is not loaded");
      return false;
    }

    var serverData = {
      amount: (orderTotal - discount).toFixed(2),
      products: cartItems,
    };

    try {
      // Make API call to create the order
      var { data } = await axios.post(
        "/api/payment?controllerName=genOrder",
        serverData
      );

      // Check if the response indicates that products are unavailable
      if (!data.status) {
        toast.error(data.message);
        return;
      }

      var order = data.order;

      var options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Next-Shopping",
        description: "Purchasing Dream Products...",
        image:
          "https://99customizedjewellery.com/wp-content/uploads/2022/01/jewel_logo.png",
        order_id: order.id,
        handler: async function (response) {
          var sendData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            email: session.user.email,
            name: session.user.name,
            products: cartItems,
            amount: (orderTotal - discount).toFixed(2),
            address: formData,
          };

          // First, call the verifyPayment API
          var { data } = await axios.post(
            "/api/payment?controllerName=verifyPayment",
            sendData
          );

          // Check if payment was successful
          if (data.status === true) {
            removeFromLocalStorage(data.removedProductIds);
            Swal.fire({
              icon: "success",
              title: "Order Placed Successfully",
              text: "Thank you for shopping with us!",
            }).then(() => {
              window.location.href = "/";
            });
          } else {
            Swal.fire({
              icon: "warning",
              title: "Payment Failed, retry Again",
            });
          }
        },
        prefill: {
          name: session.user.name,
          email: session.user.email,
          contact: userPhone,
        },
        theme: {
          color: "#ffc107ff",
        },
      };

      var razorpayObject = new Razorpay(options);
      razorpayObject.open();
    } catch (error) {
      alert("Failed to create order, please try again.");
    }
  };

  // Function to remove product IDs from local storage
  const removeFromLocalStorage = (productIds) => {
    const storedProductData = localStorage.getItem("persist:root");

    if (storedProductData) {
      // Parse the existing productData
      const parsedData = JSON.parse(storedProductData);
      const productDataString = parsedData.productData;
      let productData = JSON.parse(productDataString);

      // Filter out the product IDs to remove
      productData = productData.filter((id) => !productIds.includes(id));

      // Save the updated productData back to local storage
      parsedData.productData = JSON.stringify(productData);
      localStorage.setItem("persist:root", JSON.stringify(parsedData));
    }
  };

  const handleCheckout = async () => {
    if (!session?.user?.email) {
      router.push("/auth");
      return;
    }

    try {
      // Validate stock from the stored cartItems
      const outOfStockItems = cartItems.filter((item) => !item.stock);

      if (outOfStockItems.length > 0) {
        toast.error(
          `⚠️ The following products are out of stock: ${outOfStockItems
            .map((item) => item.name)
            .join(", ")}`
        );
        return;
      }

      displayRazorpay();
    } catch (error) {
      toast.error("An error occurred while checking product stock.");
    }
  };

  return (
    <div className="bg-white dark:bg-black pt-7">
      <div className="mx-auto max-w-2xl px-4 pb-24 pt-16 sm:px-6 lg:max-w-7xl lg:px-8">
        {isLoading ? (
          <div className="text-black dark:text-white text-center">
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-500 text-center  h-full flex items-center justify-center mt-28">
            {error}
          </div>
        ) : !cartItems.length ? (
          <div className="text-black dark:text-white text-center h-full flex items-center justify-center mt-28">
            Your checkout cart is empty.
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16 my-8">
            <div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Shipping information
                </h2>
              </div>
              {/* Address Form Section */}

              <div className="mt-10 border-t border-gray-200 pt-10">
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="firstname">Full name</Label>
                      <Input
                        id="firstname"
                        placeholder="Full Name"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={session?.user?.email || ""}
                        readOnly
                        disabled
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="9874561230"
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="secondaryPhone">Secondary number</Label>
                      <Input
                        id="secondaryPhone"
                        placeholder="9874561230"
                        type="text"
                        value={formData.secondaryPhone}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            secondaryPhone: e.target.value,
                          })
                        }
                      />
                    </LabelInputContainer>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="apartmentNumber">Apartment Number</Label>
                      <Input
                        id="apartmentNumber"
                        placeholder="12/2"
                        type="text"
                        value={formData.apartmentNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            apartmentNumber: e.target.value,
                          })
                        }
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        type="text"
                        value={formData.city}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        type="text"
                        value={formData.state}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                      />
                    </LabelInputContainer>
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        type="text"
                        value={formData.country}
                        readOnly
                        disabled
                      />
                    </LabelInputContainer>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="streetAddress">Street Address</Label>
                      <Input
                        id="streetAddress"
                        placeholder="Street Address"
                        type="text"
                        value={formData.streetAddress}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            streetAddress: e.target.value,
                          })
                        }
                      />
                    </LabelInputContainer>
                    <div className="pt-4 flex items-center">
                      <input
                        id="apartmentNumberCheckbox"
                        type="checkbox"
                        className="mr-2 h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        checked={formData.giftWrap}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            giftWrap: e.target.checked,
                          })
                        }
                      />
                      <Label
                        htmlFor="apartmentNumberCheckbox"
                        className="text-neutral-600 dark:text-neutral-300">
                        Gift Wrapping
                      </Label>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <LabelInputContainer className="flex-1">
                      <Label htmlFor="giftMessage">Gift wrap message</Label>
                      <Input
                        id="giftMessage"
                        placeholder="many more happy returns of the day"
                        type="text"
                        value={formData.giftMessage}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            giftMessage: e.target.value,
                          })
                        }
                      />
                    </LabelInputContainer>
                  </div>

                  <button
                    className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
                    type="submit">
                    Save Address &rarr;
                    <BottomGradient />
                  </button>
                </form>

                <div className="mt-10 border-t border-gray-200 pt-10">
                  <fieldset>
                    <legend className="text-lg font-medium text-gray-900 dark:text-white">
                      Delivery method
                    </legend>
                    <RadioGroup
                      value={selectedDeliveryMethod}
                      onChange={setSelectedDeliveryMethod}
                      className="mt-4 space-y-4">
                      {deliveryMethods.map((deliveryMethod) => (
                        <Radio
                          key={deliveryMethod.id}
                          value={deliveryMethod}
                          aria-label={deliveryMethod.title}
                          aria-describedby={`delivery-method-${deliveryMethod.id}`}
                          className="group relative flex cursor-pointer rounded-lg border border-gray-300 bg-white p-4 shadow-sm focus:outline-none data-[checked]:border-transparent data-[focus]:ring-2 data-[focus]:ring-indigo-500">
                          <span className="flex flex-1 flex-col">
                            <span className="block text-sm font-medium text-gray-900">
                              {deliveryMethod.title}
                            </span>
                            <span className="mt-1 flex items-center text-sm text-gray-500">
                              {deliveryMethod.turnaround}
                            </span>
                            <span className="mt-6 text-sm font-medium text-gray-900">
                              {deliveryMethod.price}
                            </span>
                          </span>
                          <CheckCircleIcon
                            aria-hidden="true"
                            className="h-5 w-5 text-indigo-600 [.group:not([data-checked])_&]:hidden"
                          />
                          <span
                            aria-hidden="true"
                            className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-500"
                          />
                          {/* Add a description element */}
                          <span
                            id={`delivery-method-${deliveryMethod.id}`}
                            className="sr-only">
                            {deliveryMethod.turnaround} for{" "}
                            {deliveryMethod.price}
                          </span>
                        </Radio>
                      ))}
                    </RadioGroup>
                  </fieldset>
                </div>
              </div>
            </div>

            {/* Order Summary Section */}
            <div className="mt-10 lg:mt-0">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white ">
                Order summary
              </h2>

              <div className="mt-4 rounded-lg border border-gray-200 bg-white shadow-sm">
                <h3 className="sr-only">Items in your cart</h3>
                <ul role="list" className="divide-y divide-gray-200">
                  {cartItems.map((product) => (
                    <li
                      key={product.productId}
                      className="flex px-4 py-6 sm:px-6 overflow-y-auto">
                      <Link
                        href={{
                          pathname: "/product-category",
                          query: { p: encryptId(product.productId) }, // Encrypt the productId
                        }}>
                        <div className="flex-shrink-0">
                          <Image
                            alt={product.name}
                            src={product.imageUrl}
                            className="w-20 rounded-md"
                            height={100}
                            width={100}
                            draggable="false"
                          />
                        </div>
                      </Link>

                      <div className="ml-6 flex flex-1 flex-col">
                        <div className="flex">
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm">
                              <a
                                href="#"
                                className="font-medium text-gray-700 hover:text-gray-800">
                                {product.name}
                              </a>
                            </h4>
                            <p className="mt-1 text-sm text-gray-500">
                              {product.description}
                            </p>
                          </div>

                          <div>
                            <div className="ml-4 flow-root flex-shrink-0">
                              <button
                                type="button"
                                className="-m-2.5 flex items-center justify-center bg-white p-2.5 text-gray-400 hover:text-gray-500"
                                onClick={() =>
                                  handleDeleteClick(product.productId)
                                }>
                                <span className="sr-only">Remove</span>
                                <TrashIcon
                                  aria-hidden="true"
                                  className="h-5 w-5 text-red-500 hover:text-gray-500"
                                />
                              </button>
                            </div>

                            {/* Confirmation Popup */}
                            {showPopup && (
                              <div className="fixed inset-0 flex items-center justify-center z-50">
                                <div className="relative rounded-lg">
                                  <div
                                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a]
                                     to-[#ffc107] blur-sm"></div>
                                  <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10">
                                    <p>
                                      Are you sure you want to delete this
                                      product?
                                    </p>
                                    <div className="flex justify-end mt-4">
                                      <button
                                        className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                        onClick={(event) =>
                                          handleConfirmDelete(
                                            event,
                                            product.productId
                                          )
                                        }>
                                        Yes
                                      </button>
                                      <button
                                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                                        onClick={handleCancel}>
                                        No
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-1 items-end justify-between pt-2">
                          <div className="flex gap-2">
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-black">
                              ₹ {product.price}
                            </p>
                            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-black">
                              <del>₹ {product.oldPrice}</del>
                            </p>

                            <span
                              className={
                                product.stock
                                  ? "text-green-500"
                                  : "text-red-500 text-sm flex justify-center items-center"
                              }>
                              {product.stock ? "" : "*Out of Stock"}
                            </span>
                          </div>

                          <div className="ml-4">
                            <label htmlFor="quantity" className="sr-only">
                              Quantity
                            </label>
                            <select
                              id="quantity"
                              name="quantity"
                              className="max-w-full rounded-md border border-gray-300 py-1.5 
                              text-left text-base font-medium leading-5 text-[#ffc107ff]  shadow-sm
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
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <dl className="space-y-6 border-t border-gray-200 px-4 py-6 sm:px-6">
                  <div className="flex items-center justify-between">
                    <dt className="text-sm dark:text-black">Subtotal</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {" "}
                      ₹ {subtotal.toFixed(2)}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm flex">
                      {" "}
                      <span className="  dark:text-black">
                        Shipping estimate
                      </span>
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
                  <div className="flex items-center justify-between">
                    <dt className="text-sm flex">
                      <span className="dark:text-black">Tax estimate</span>
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
                      ₹ {tax}
                    </dd>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-200 pt-6">
                    <dt className="text-base font-medium dark:text-black">
                      Total
                    </dt>
                    {/* Coupon Code Section */}
                    <div className="flex flex-col sm:flex-row items-center justify-center">
                      {!isCouponApplied ? (
                        <>
                          <input
                            type="text"
                            placeholder="Enter coupon code"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value)}
                            className="border border-gray-300 rounded-md p-2 mb-3 sm:mb-0 sm:mr-2 w-40 sm:w-auto"
                          />
                          <button
                            type="button"
                            className="bg-[#ffc107ff] text-white px-4 py-2 rounded-md w-full sm:w-auto"
                            onClick={handleApplyCoupon}>
                            Apply
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-500 text-center text-sm sm:text-base">
                          Coupon code applied!{" "}
                          <span className="text-red-600 block sm:inline">
                            Don’t back or refresh
                          </span>
                        </span>
                      )}
                    </div>

                    <dd className="text-base font-medium text-gray-900">
                      ₹ {(orderTotal - discount).toFixed(2)}{" "}
                    </dd>
                  </div>
                </dl>

                <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                  <button
                    onClick={handleCheckout}
                    className="w-full rounded-md 
                       bg-[#ffc107ff] px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-[#e8126aff] 
                       bg-gradient-to-r from-[#e8126a]  to-[#ffc107]
                        ">
                    Place order
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "linear-gradient(to right, #e8126a, #ffc107)",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};

// Subtotal calculation function
function calculateSubtotal(cartItems) {
  return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
}
