"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import CryptoJS from "crypto-js";
import config from "@/config";
import { _get, _post } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";

const OrderHistory = () => {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState([]);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [productIds, setProductIds] = useState("");
  const [submittedReviewIds, setSubmittedReviewIds] = useState(new Set());

  useEffect(() => {
    const fetchOrders = async () => {
      if (session?.user?.id) {
        try {
          const userId = session.user.id;

          // Fetch orders
          const apiResponse = await _get(`/api/products`, {
            controllerName: "getOrdersByUserId",
            userId,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          const orders = response.orders;
          // Extract product IDs
          const productIds = orders.flatMap((order) =>
            order.products.map((product) => product.productId)
          );

          const productIdString = productIds.join(", ");
          setProductIds(productIdString);

          // Sort orders by date
          const sortedOrders = (orders || []).sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setOrders(sortedOrders);

          // Fetch user reviews
          const apiResponseReview = await _get(`/api/visitor`, {
            controllerName: "getUserReviews",
            userId,
          });

          const reviewResponse = config.isProduction
            ? decryptData(apiResponseReview.encrypt)
            : apiResponseReview.encrypt;

          // Extract review IDs
          const reviewIds = new Set(
            reviewResponse.reviews.map((review) => review.orderId)
          );
          setSubmittedReviewIds(reviewIds);
        } catch (error) {
          console.error("Error fetching orders or reviews:", error);
        }
      }
    };

    if (status === "authenticated") {
      fetchOrders();
    }
  }, [session, status]);

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  const getOrderStep = (orderStatus) => {
    switch (orderStatus) {
      case "placed":
        return 0;
      case "processing":
        return 1;
      case "shipped":
        return 2;
      case "delivered":
        return 3;
      default:
        return 0;
    }
  };

  orders.forEach((order) => {
    order.orderStep = getOrderStep(order.orderStatus);
  });

  // Open review modal and set the selected order
  const openReviewModal = (order) => {
    setSelectedOrder(order);
    setIsReviewModalOpen(true);

    // Set product IDs as an array for the selected order
    const selectedProductIds = order.products.map(
      (product) => product.productId
    );

    setProductIds(selectedProductIds);

    setReviews(
      order.products.map((product) => ({
        productId: product.productId, // Assign unique productId
        reviewText: "", // Empty initial review text
        rating: 0, // Default rating
      }))
    );
  };

  // Close review modal
  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedOrder(null);
    setReviews([]); // Reset reviews state
  };

  const handleReviewChange = (index, field, value) => {
    const newReviews = [...reviews];
    newReviews[index][field] = value; // Dynamically update each product's review
    setReviews(newReviews);
  };

  // Handle review submission for multiple products
  const handleSubmitReview = async () => {
    try {
      // Submit reviews for all products in the selected order
      for (let i = 0; i < reviews.length; i++) {
        const review = reviews[i];
        await _post(`/api/visitor`, {
          controllerName: "addReview",
          orderId: selectedOrder.orderId,
          productId: review.productId, // Use the correct productId for each review
          rating: review.rating,
          reviewText: review.reviewText,
          userId: session.user.id,
          userName: session.user.name,
          userImage: session.user.image,
        });

        setSubmittedReviewIds((prev) => new Set(prev).add(review.orderId));
      }
      closeReviewModal();
      alert("Reviews submitted successfully!");
    } catch (error) {
      console.error("Error submitting review", error);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
        <h2 className="text-2xl font-semibold text-black dark:text-white text-center py-3">
          Order History
        </h2>

        {orders.length === 0 ? (
          <p className="text-lg text-center">Order is empty</p>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <div key={order._id}>
                {/* Order ID and Created At */}
                <div className="space-y-2 px-4 py-5 border-t-2 border-neutral-200 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-6">
                  <div className="flex items-baseline gap-3">
                    <h1 className="text-lg font-bold tracking-tight text-gray-600">
                      Order ID:{" "}
                      <span className="dark:text-white sm:text-xl">
                        {order.orderId}
                      </span>
                    </h1>
                  </div>

                  <p className="text-sm text-gray-600 mt-2 sm:mt-0">
                    Order placed:{" "}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </p>
                </div>

                {/* Order Details */}
                <div className="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg">
                  <div className="px-4 py-6 sm:px-6 lg:grid lg:grid-cols-12 lg:gap-x-8 lg:p-8">
                    <div className="sm:flex lg:col-span-7 flex-wrap h-48 overflow-y-auto">
                      {order.products.map((product) => (
                        <div
                          key={product._id}
                          className="flex flex-col sm:flex-row mb-4">
                          <div
                            className="w-full sm:w-40 sm:h-40 aspect-w-1 aspect-h-1
            border-b border-t border-gray-900 flex-shrink-0 overflow-hidden rounded-lg 
            flex justify-center sm:justify-start">
                            <Link
                              href={{
                                pathname: "/product-category",
                                query: { p: encryptId(product.productId) },
                              }}>
                              <Image
                                src={product.imageUrl}
                                alt={product.name}
                                width={200}
                                height={200}
                                draggable="false"
                                className="md:w-full md:h-auto sm:w-20 sm:h-20 object-cover rounded-lg"
                              />
                            </Link>
                          </div>
                          <div className="ml-0 sm:ml-4 flex flex-col justify-start">
                            <h3 className="text-lg font-semibold dark:text-black">
                              {product.name}
                            </h3>
                            <p className="text-gray-700">
                              ₹ {product.price} x {product.quantity}
                            </p>
                            <p className="text-sm text-gray-500">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery and Shipping */}
                    <div className="mt-6 lg:col-span-5 lg:mt-0 flex flex-col justify-between space-y-6">
                      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 text-sm">
                        <div>
                          <dt className="font-medium text-gray-900">
                            Delivery address
                          </dt>
                          <dd className="mt-3 text-gray-500">
                            <span className="block">
                              {order.delivery.apartmentNumber},{" "}
                              {order.delivery.streetAddress}
                            </span>
                            <span className="block">
                              {order.delivery.city}, {order.delivery.state}
                            </span>
                            <span className="block">
                              {order.delivery.country}
                            </span>
                          </dd>
                        </div>

                        <div>
                          <dt className="font-medium text-gray-900">
                            Shipping information
                          </dt>
                          <dd className="mt-3  text-gray-500">
                            <span className="block">
                              {order.delivery.fullName},
                            </span>
                            <span className="block">{order.email},</span>
                            <span className="block">
                              {order.delivery.phone},{" "}
                              {order.delivery.secondaryPhone}
                            </span>
                            <span className="block"></span>
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>

                  {/* Status Progress */}
                  <div className="border-t border-gray-200 px-4 py-6 sm:px-6 lg:p-8">
                    <h4 className="sr-only">Status</h4>
                    <div className="flex justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        <span className="text-gray-500">
                          {order.orderStatus} on{" "}
                        </span>
                        <time dateTime={order.createdAt}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </time>
                      </p>

                      <p className="dark:text-black">
                        <span className="text-gray-500">Total Amount: </span>₹{" "}
                        {order.totalAmount}
                      </p>
                    </div>

                    {/* Check if order is cancelled */}
                    {order.orderStatus === "cancelled" ? (
                      <div className="mt-6 text-center text-red-600 font-bold bg-red-100 p-4 rounded">
                        Order is cancelled
                      </div>
                    ) : order.orderStatus === "delivered" ? (
                      <div className=" text-center">
                        {order.orderStatus === "delivered" &&
                          !submittedReviewIds.has(order.orderId) && (
                            <div className="text-center">
                              <button
                                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                                onClick={() => openReviewModal(order)}>
                                Write a Review
                              </button>
                            </div>
                          )}
                      </div>
                    ) : (
                      <div aria-hidden="true" className="mt-6">
                        {/* Progress Bar */}
                        <div className="overflow-hidden rounded-full bg-gray-200">
                          <div
                            style={{
                              width: `${(order.orderStep + 1) * 25}%`, // Adjust based on the step
                            }}
                            className="h-2 rounded-full bg-[#ffc107ff]"
                          />
                        </div>

                        {/* Status Text */}
                        <div className="mt-6 grid grid-cols-4 text-sm font-medium text-gray-600">
                          <div
                            className={`text-center ${
                              order.orderStep >= 0 ? "text-[#e8126aff]" : ""
                            }`}>
                            Order placed
                          </div>
                          <div
                            className={`text-center ${
                              order.orderStep >= 1 ? "text-[#e8126aff]" : ""
                            }`}>
                            Processing
                          </div>
                          <div
                            className={`text-center ${
                              order.orderStep >= 2 ? "text-[#e8126aff]" : ""
                            }`}>
                            Shipped
                          </div>
                          <div
                            className={`text-right ${
                              order.orderStep >= 3 ? "text-[#e8126aff]" : ""
                            }`}>
                            Delivered
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {isReviewModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded-md w-11/12 md:w-1/2">
              <h3 className="text-xl font-semibold mb-4">
                Write Reviews for Your Products
              </h3>
              {selectedOrder.products.map((product, index) => (
                <div key={product._id} className="mb-6">
                  <h4 className="text-lg font-semibold">{product.name}</h4>
                  <textarea
                    value={reviews[index].reviewText}
                    onChange={(e) =>
                      handleReviewChange(index, "reviewText", e.target.value)
                    }
                    className="w-full border rounded-md p-2 mb-2"
                    placeholder={`Write your review for ${product.name}`}></textarea>
                  <div className="mb-4">
                    <span className="font-medium mr-2">Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() =>
                          handleReviewChange(index, "rating", star)
                        }
                        className={
                          star <= reviews[index].rating
                            ? "text-yellow-500"
                            : "text-gray-400"
                        }>
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleSubmitReview}>
                Submit Reviews
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
