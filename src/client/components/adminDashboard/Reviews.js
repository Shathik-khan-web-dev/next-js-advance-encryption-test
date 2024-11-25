"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import CryptoJS from "crypto-js";
import Link from "next/link";
import AddReviews from "./AddReviews";
import UpdateReviewModal from "./UpdateReviewModal";
import config from "@/config";
import { _get, _put, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/utils/cn";
import { FiUser } from "react-icons/fi";
import { CgShoppingCart } from "react-icons/cg";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import toast, { Toaster } from "react-hot-toast";

export default function ReviewPage() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState("");
  const [view, setView] = useState("");
  const [userDetails, setUserDetails] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null); // Added for delete confirmation
  const [IsLoading, setIsLoading] = useState();
  const [error, setError] = useState();

  // Fetch reviews based on the selected duration or search term
  useEffect(() => {
    const fetchReviews = async () => {
      if (!selectedDuration && !searchTerm) return;

      setLoading(true);
      try {
        const apiResponse = await _get(`/api/admin`, {
          controllerName: "getFilteredReviews",
          filter: selectedDuration,
          search: searchTerm,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const sortedReviews = response.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setReviews(sortedReviews);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [selectedDuration, searchTerm]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    setSelectedDuration(value);

    if (value === "addReview") {
      setView("addReview");
    } else {
      setView("allReviews");
    }
  };

  const showUserDetails = async (userId) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getSingleUser",
        userId: userId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        setUserDetails(response.user);
      } else {
        setError("Failed to fetch user data");
      }
    } catch (error) {
      setError("Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  const showProductDetails = async (productId) => {
    setIsLoading(true);
    setError(null);

    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getSingleProduct",
        productId: productId,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        setProductDetails(response.product);
      } else {
        setError("Failed to fetch user data");
      }
    } catch (error) {
      setError("Error fetching user data");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setUserDetails(null);
    setProductDetails(null);
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  const openUpdateModal = (review) => {
    setSelectedReview(review);
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setSelectedReview(null);
    setIsUpdateModalOpen(false);
  };

  const handleUpdateSubmit = async (updatedReview) => {
    try {
      const apiResponse = await _put(`/api/admin`, {
        controllerName: "updateReview",
        reviewId: updatedReview._id,
      });

      response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        toast.success(response.message);
      } else {
        toast.error(error.message);
      }

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === updatedReview._id ? updatedReview : review
        )
      );
      closeUpdateModal();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  const handleDelete = async (review) => {
    try {
      const apiResponse = await _delete(`/api/admin`, {
        controllerName: "deleteReview",
        reviewId: review._id,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      setReviews((prevReviews) =>
        prevReviews.filter((r) => r._id !== review._id)
      );
      setShowPopup(false);
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const openDeletePopup = (review) => {
    setReviewToDelete(review);
    setShowPopup(true);
  };

  const closeDeletePopup = () => {
    setShowPopup(false);
    setReviewToDelete(null);
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div
        className="p-2 md:p-5 rounded-tl-2xl border border-neutral-200
       dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col 
       gap-2 flex-1 w-full h-full overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-evenly gap-4 md:gap-11 mb-2 ">
          <div>
            <LabelInputContainer>
              <Input
                type="text"
                className="border dark:border-neutral-700 p-2 rounded-xl w-full md:w-72 dark:bg-black"
                placeholder="Search by user or product names..."
                value={searchTerm}
                onChange={handleSearch}
              />
            </LabelInputContainer>
          </div>
          <span className="hidden sm:block text-2xl  text-[#ffc107ff] underline underline-offset-2 -ml-10">
            All Reviews
          </span>
          <select
            className="w-full md:w-auto border border-gray-800 bg-white dark:bg-black 
             dark:text-[#e8126aff] text-black rounded-md h-10 px-2 focus:outline-none 
             focus:ring-2 focus:ring-[#ffc107ff] hover:bg-white hover:text-black"
            value={selectedDuration}
            onChange={handleDurationChange}>
            <option value="">Select Review</option>
            <option value="addReview">Add Review</option>
            <option value="all">All Reviews</option>
            <option value="1day">1 Day Review</option>
            <option value="7days">7 Days Review</option>
            <option value="1month">1 Month Review</option>
          </select>
        </div>

        {view === "addReview" && <AddReviews />}

        {view === "allReviews" && (selectedDuration || searchTerm) && (
          <div>
            {loading ? (
              <p className="mt-4">Loading reviews...</p>
            ) : (
              <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-neutral-800">
                <table className="min-w-full table-auto bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr className="bg-gray-200 dark:bg-neutral-700 text-center">
                      <th className="px-1 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        No
                      </th>
                      <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        Image
                      </th>
                      <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        Name
                      </th>
                      <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        Review
                      </th>

                      <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        Rating
                      </th>
                      <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-600 text-sm text-center">
                    {reviews.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="text-center py-4">
                          No reviews available.
                        </td>
                      </tr>
                    ) : (
                      reviews.map((review, index) => (
                        <tr
                          key={review._id}
                          className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                          <td className="  border dark:border-neutral-700  text-[#e8126aff]">
                            {index + 1}
                          </td>
                          <td className=" py-2 flex justify-center items-center  text-gray-500 dark:text-gray-400">
                            <Image
                              src={review.userImage}
                              alt={review.userImage}
                              height={50}
                              width={50}
                              className="rounded-full"
                              draggable="false"
                            />
                          </td>
                          <td className=" border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                            {review.userName}
                          </td>
                          <td className=" p-1 border dark:border-neutral-700">
                            <textarea
                              className="text-sm w-full px-2 py-1 focus:outline-none border dark:border-neutral-700 rounded text-gray-500 dark:text-gray-400"
                              value={review.reviewText}
                              placeholder="Enter your review here"
                              rows={2}
                              readOnly
                            />
                          </td>
                          <td className=" border dark:border-neutral-700 text-gray-500 dark:text-gray-400">
                            <div className="flex items-center justify-center">
                              {Array.from({ length: 5 }).map((_, index) =>
                                index < review.rating ? (
                                  <AiFillStar
                                    key={index}
                                    className="text-yellow-500"
                                  />
                                ) : (
                                  <AiOutlineStar
                                    key={index}
                                    className="text-yellow-500"
                                  />
                                )
                              )}
                            </div>
                          </td>

                          <td className="border dark:border-neutral-700">
                            <div className="flex items-center justify-evenly">
                              <FiUser
                                className="text-lg cursor-pointer text-[#0078d7ff] hover:text-gray-500 "
                                onClick={() => showUserDetails(review.userId)}
                              />
                              <CgShoppingCart
                                className="text-lg cursor-pointer text-[#e8126aff] hover:text-gray-500"
                                onClick={() =>
                                  showProductDetails(review.productId)
                                }
                              />
                              {/*       <PencilSquareIcon
                              className="w-5 h-5 hover:text-blue-500"
                              onClick={() => openUpdateModal(review)}
                            />

                            {isUpdateModalOpen && selectedReview && (
                              <UpdateReviewModal
                                review={selectedReview}
                                isOpen={isUpdateModalOpen}
                                onClose={closeUpdateModal}
                                onSubmit={handleUpdateSubmit}
                              />
                            )} */}
                              <TrashIcon
                                className="w-5 h-5 text-red-500 hover:text-gray-500 cursor-pointer"
                                onClick={() => openDeletePopup(review)}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {userDetails && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeModal}>
            <div
              className="bg-white dark:bg-neutral-800 rounded-lg p-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()} // Prevent click from closing modal
            >
              <h2 className="text-lg font-semibold">User Details</h2>
              <div className="flex items-center mb-4">
                <Image
                  src={userDetails.image}
                  alt={userDetails.name}
                  width={100}
                  height={100}
                  className="w-16 h-16 rounded-full mr-4"
                />
                <div>
                  <p>
                    <strong>Name:</strong> {userDetails.name}
                  </p>
                  <p>
                    <strong>Email:</strong> {userDetails.email}
                  </p>
                  <p>
                    <strong>Role:</strong> {userDetails.role}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Delivery Details</h3>
                <p>
                  <strong>Phone Number:</strong>{" "}
                  {userDetails.delivery.phoneNumber || "N/A"}
                </p>
                <p>
                  <strong>Secondary Number:</strong>{" "}
                  {userDetails.delivery.secondaryNumber || "N/A"}
                </p>
                <p>
                  <strong>City:</strong> {userDetails.delivery.city || "N/A"}
                </p>
                <p>
                  <strong>State:</strong> {userDetails.delivery.state || "N/A"}
                </p>
                <p>
                  <strong>Street Address:</strong>{" "}
                  {userDetails.delivery.streetAddress || "N/A"}
                </p>
                <p>
                  <strong>Created At:</strong> {userDetails.createdAt || "N/A"}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
                Close
              </button>
            </div>
          </div>
        )}

        {productDetails && (
          <div
            className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
            onClick={closeModal}>
            <div
              className="bg-white dark:bg-neutral-800 rounded-lg p-4 max-w-sm w-full"
              onClick={(e) => e.stopPropagation()}>
              <h2 className="text-lg font-semibold">Product Details</h2>
              <div className="flex items-center mb-4">
                <Link
                  href={{
                    pathname: "/product-category",
                    query: { p: encryptId(productDetails.productId) },
                  }}>
                  <Image
                    src={productDetails.imageUrl}
                    alt={productDetails.name}
                    width={100}
                    height={100}
                    className="w-16 h-16 rounded-full mr-4"
                  />
                </Link>
                <div>
                  <p>
                    <strong>Name:</strong> {productDetails.name}
                  </p>
                  <p>
                    <strong>Category:</strong> {productDetails.category}
                  </p>
                  <p>
                    <strong>Price:</strong> ₹{productDetails.price}
                  </p>
                  <p>
                    <strong>Old Price:</strong>
                    <del>₹{productDetails.oldPrice}</del>
                  </p>
                  <p>
                    <strong>Product Id:</strong>
                    {productDetails.productId}
                  </p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Additional Details</h3>
                <p>
                  <strong>Description:</strong> {productDetails.description}
                </p>
                <p>
                  <strong>Quantity:</strong> {productDetails.quantity}
                </p>
                <p>
                  <strong>Rating:</strong> {productDetails.rating} (
                  {productDetails.ratingsCount} reviews)
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(productDetails.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
                Close
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Popup for Deletion */}
        {showPopup && reviewToDelete && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="relative rounded-lg">
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>
              <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10">
                <p>Are you sure you want to delete this review?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                    onClick={() => handleDelete(reviewToDelete)}>
                    Yes
                  </button>
                  <button
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
                    onClick={closeDeletePopup}>
                    No
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
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
}

const LabelInputContainer = ({ children, className }) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
