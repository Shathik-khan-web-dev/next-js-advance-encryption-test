"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import config from "@/config";
import { cn } from "@/client/utils/cn";
import { _get, _post } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

export default function AddReviews() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [formData, setFormData] = useState({
    userId: "", // Assuming userId is needed
    // orderId: "",
    rating: "",
    reviewText: "",
  });

  // Debounce the search term so that the API is only called after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Delay of 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (debouncedSearchTerm.length > 0) {
        try {
          const apiResponse = await _get(
            `/api/products/${debouncedSearchTerm}`
          );

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          setSearchResults([response]);
        } catch (error) {
          setSearchResults([]); // Clear results if no product found
        }
      }
    };

    fetchProducts();
  }, [debouncedSearchTerm]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchTerm(product.productId);
    setFormData((prev) => ({
      ...prev,
      userId: session?.user?.id, // Replace with actual user ID from your auth system
    }));
    setSearchResults([]); // Hide the dropdown after selection
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Prepare review data
      const reviewData = {
        productId: selectedProduct?.productId,
        userId: formData.userId,
        rating: formData.rating,
        reviewText: formData.reviewText,
      };

      // Send review data to backend
      const apiResponse = await _post(`/api/admin`, {
        controllerName: "addReviewAdmin",
        reviewData: reviewData,
      });

      console.log(apiResponse);

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      console.log(response);

      toast.success(response.message, {
        duration: 3000,
      });

      // Reset form fields
      setFormData({
        userId: "", // Clear userId or set appropriately
        rating: "",
        reviewText: "",
      });
      setSelectedProduct(null); // Clear selected product
    } catch (error) {
      toast.error("Error adding review.");
    }
  };

  return (
    <div className="flex flex-1">
      <div
        className="p-2 pt-5 rounded-tl-2xl  bg-white
       dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full md:overflow-y-auto overflow-y-auto ">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 shadow-input bg-white dark:bg-black rounded-lg ">
          <h2 className="text-2xl font-semibold text-black dark:text-white text-center py-3">
            Add Review
          </h2>

          <div>
            <Label htmlFor="searchProduct">Search Product</Label>
            <Input
              name="searchProduct"
              placeholder="Search Product"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              required
            />
            {searchResults.length > 0 && (
              <ul className="z-20">
                {searchResults.map((product) => (
                  <li
                    key={product.productId}
                    onClick={() => handleSelectProduct(product)}
                    style={{
                      border: "1px solid #ccc",
                      padding: "10px",
                      margin: "10px 0",
                      cursor: "pointer",
                    }}>
                    <div className="flex">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        width={100}
                        height={50}
                        className="object-cover rounded-full"
                      />
                    </div>
                    <div>
                      <h3>
                        {product.name} ({product.productId})
                      </h3>
                      <p>
                        <strong>Category:</strong> {product.category}
                      </p>
                      <p>
                        <strong>Price:</strong> ${product.price}
                      </p>
                      {product.oldPrice && (
                        <p>
                          <strong>Old Price:</strong> ${product.oldPrice}
                        </p>
                      )}
                      <p>
                        <strong>Description:</strong> {product.description}
                      </p>
                      <p>
                        <strong>Rating:</strong> {product.rating} (
                        {product.ratingsCount} reviews)
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedProduct && (
            <div>
              <h2>Selected Product: {selectedProduct.name}</h2>
            </div>
          )}

          <form className="my-8" onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label htmlFor="rating">Rating</Label>
              <Input
                name="rating"
                placeholder="Rating (1-5)"
                type="number"
                min="1"
                max="5"
                required
                value={formData.rating}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-4">
              <Label htmlFor="reviewText">ReviewText</Label>
              <textarea
                name="reviewText"
                placeholder="Product ReviewText"
                className="block w-full px-3 py-2 border border-gray-800 bg-white dark:bg-black dark:text-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-white"
                rows="4"
                value={formData.reviewText}
                onChange={handleInputChange}
                required
              />
            </div>

            <button
              className="bg-gradient-to-br from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium"
              type="submit">
              Add Review &rarr;
            </button>
          </form>
        </div>
        <Toaster
          position="top-center"
          toastOptions={{ style: { background: "#000", color: "#fff" } }}
        />
      </div>
    </div>
  );
}
