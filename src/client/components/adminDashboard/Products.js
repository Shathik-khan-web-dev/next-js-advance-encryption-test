"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import CryptoJS from "crypto-js";
import Link from "next/link";
import UpdateProductModal from "./UpdateProductModal";
import AddProduct from "./AddProduct";
import config from "@/config";
import { _get, _put, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/utils/cn";
import toast, { Toaster } from "react-hot-toast";
import {
  PencilSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XCircleIcon,
} from "@heroicons/react/20/solid";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [productCount, setProductCount] = useState(0);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [noProductsMessage, setNoProductsMessage] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productIdToRemove, setProductIdToRemove] = useState(null);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (selectedCategory) {
      fetchProducts(); // Fetch products only if a category is selected
    }
  }, [selectedCategory, debouncedSearchTerm, currentPage]);

  // Debounce search term
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 1 second debounce

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  // Fetch products based on selected category, search term, and pagination
  const fetchProducts = async () => {
    setLoading(true);
    setNoProductsMessage(""); // Reset message before fetching
    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getProducts",
        category: selectedCategory,
        searchQuery: debouncedSearchTerm,
        page: currentPage,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      setProducts(response.products);
      setProductCount(response.products.length);
      setTotalPages(response.totalPages);

      // Set no products message if the array is empty
      if (response.products.length === 0) {
        setNoProductsMessage("Products not available");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch all available product categories
  const fetchCategories = async () => {
    try {
      const apiResponse = await _get(`/api/admin`, {
        controllerName: "getCategories",
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;
      setCategories(response.categories);
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };

  useEffect(() => {
    fetchCategories(); // Fetch categories on load
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    const value = e.target.value;

    if (value === "addProduct") {
      // Clear previous category data when adding a product
      setSelectedCategory("");
      setProducts([]);
      setProductCount(0);
      setShowAddProductForm(true);
      return;
    }

    // For other categories, clear all previous states
    setShowAddProductForm(false);
    setSelectedCategory(value);
    setProducts([]);
    setProductCount(0);
    setCurrentPage(1);
    setLoading(true);
    setNoProductsMessage("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleProductUpdated = () => {
    fetchProducts(); // Refresh product list after update
  };

  const handleDeleteClick = (productId) => {
    setProductIdToRemove(productId);
    setShowPopup(true);
  };

  const handleCancel = () => {
    setShowPopup(false);
    setProductIdToRemove(null);
  };

  const handleConfirmDelete = async () => {
    try {
      if (!productIdToRemove) return;

      const apiResponse = await _delete(`/api/admin`, {
        controllerName: "deleteProduct",
        productId: productIdToRemove,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      toast.success(`${response.message}`);

      if (apiResponse.status === 200) {
        // Filter out the deleted product from the state
        const updatedProducts = products.filter(
          (product) => product.productId !== productIdToRemove
        );
        setProducts(updatedProducts);

        // If no products are left, display the "no products" message
        if (updatedProducts.length === 0) {
          setNoProductsMessage("Products not available");
        }

        setShowPopup(false);
        setProductIdToRemove(null);
      } else {
        setError("Failed to delete product");
      }
    } catch (error) {
      setError("Error deleting product: " + error.message);
    } finally {
      setShowPopup(false);
      setProductIdToRemove(null);
    }
  };

  const handleUpdate = (product) => {
    setSelectedProduct(product); // Set the selected product
    setIsModalOpen(true); // Open the modal
  };

  const handleModalClose = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedProduct(null); // Clear selected product
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  const toggleAddProductForm = () => {
    setShowAddProductForm((prevState) => !prevState);
  };

  // Function to handle opening the stock modal
  const handleStockClick = (product) => {
    console.log(product);

    setSelectedStockProduct(product); // Store product info
    setIsStockModalOpen(true); // Open modal
  };

  // Function to close the stock modal
  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setSelectedStockProduct(null);
  };

  const handleDropdownChange = (stockStatus) => {
    if (!selectedStockProduct) return;

    setSelectedStockProduct((prev) => ({
      ...prev,
      stock: stockStatus === "true", // Update stock value locally
    }));
  };

  const updateStockInBackend = async () => {
    try {
      const apiResponse = await _put("/api/admin", {
        controllerName: "updateStock",
        productId: selectedStockProduct.productId,
        stock: selectedStockProduct.stock,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        // Update the products state locally
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.productId === selectedStockProduct.productId
              ? { ...product, stock: selectedStockProduct.stock }
              : product
          )
        );

        toast.success(response.message);
        closeStockModal();
      } else {
        toast.error("Error updating stock:", response.message);
      }
    } catch (error) {
      toast.error(
        "Failed to update stock:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="flex flex-1 overflow-y-auto">
      <div
        className="p-2 md:p-5 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700
        bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full overflow-y-auto">
        {/* Category Dropdown and Search Input */}
        <div className="flex flex-col md:flex-row justify-evenly mb-4 gap-2  ">
          <div>
            <LabelInputContainer>
              <Input
                type="text"
                className="border dark:border-neutral-700 p-2 rounded-xl w-full md:w-72 dark:bg-black"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={handleSearch}
                disabled={!selectedCategory}
              />
            </LabelInputContainer>
          </div>

          <span className="hidden sm:block text-xl text-[#ffc107ff] underline underline-offset-2">
            All Product's
          </span>

          {/* Product Count */}
          {selectedCategory && !loading && productCount > 0 && (
            <div className="flex justify-between text-[#e8126aff] underline underline-offset-2">
              <span className="text-xl">
                Total Products:{" "}
                <span className="text-[#ffc107ff]">[{productCount}]</span>
              </span>
            </div>
          )}

          <select
            className=" p-2 w-full md:w-auto border border-gray-800 bg-white dark:bg-black 
                 dark:text-[#ffc107ff] text-black rounded-md focus:outline-none focus:ring-2
                 focus:ring-[#e8126aff] hover:bg-white hover:text-black "
            value={selectedCategory}
            onChange={handleCategoryChange}>
            <option value="">Select Category</option>
            <option value="addProduct">Add Product</option>
            {categories.map((category) => (
              <option key={category._id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {showAddProductForm && (
          <div className="mt-4">
            <AddProduct />
          </div>
        )}

        {/* Show message if no category is selected and "Add Product" form is not visible */}
        {!selectedCategory && !showAddProductForm && (
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-[#e8126aff]">
              Please select a category to view products.
            </p>
          </div>
        )}

        {/* Show no products message */}
        {noProductsMessage && (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{noProductsMessage}</p>
          </div>
        )}

        {/* Products Table */}
        {selectedCategory && !loading && products.length > 0 && (
          <div className="overflow-x-auto shadow-md rounded-lg bg-white dark:bg-neutral-800">
            <table className="min-w-full table-auto bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700">
              <thead className="bg-gray-50 dark:bg-neutral-800 ">
                <tr className="bg-gray-200 dark:bg-neutral-700 text-center">
                  <th className="px-1 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    No
                  </th>
                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Image
                  </th>
                  <th className="px-4 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Name
                  </th>
                  <th className="px-4 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Description
                  </th>

                  <th className="px-2 py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Price
                  </th>
                  <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Old Price
                  </th>
                  <th className="py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Stock
                  </th>
                  <th className=" py-3 text-sm border dark:border-neutral-700 text-black dark:text-[#ffc107ff]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-600">
                {products.map((product, index) => (
                  <tr
                    key={product._id}
                    className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                    <td className=" py-2 border dark:border-neutral-700 text-center text-[#e8126aff]">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 border dark:border-neutral-700 flex justify-center items-center">
                      <Link
                        href={{
                          pathname: "/product-category",
                          query: { p: encryptId(product.productId) },
                        }}>
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={70}
                          height={70}
                          draggable="false"
                          className="w-12 h-12 object-cover rounded-md "
                        />
                      </Link>
                    </td>
                    <td className="py-2 border dark:border-neutral-700 text-center text-sm text-gray-500 dark:text-gray-400">
                      {product.name}
                    </td>
                    <td className="text-sm px-1 py-1 border dark:border-neutral-700">
                      <textarea
                        className="text-sm w-full px-2 py-1 focus:outline-none border dark:border-neutral-700 rounded text-gray-500 dark:text-gray-400"
                        value={product.description}
                        placeholder="Enter your review here"
                        rows={2}
                        readOnly
                      />
                    </td>

                    <td className=" py-2 text-center text-sm border dark:border-neutral-700 text-green-500">
                      ₹ {product.price}
                    </td>
                    <td className=" py-2  text-center text-sm text-red-400 border dark:border-neutral-700 ">
                      <del> ₹ {product.oldPrice}</del>
                    </td>

                    <td className="py-2 border  dark:border-neutral-700 flex justify-center items-center">
                      {product.stock ? (
                        <CheckIcon
                          className="h-12 w-5 text-green-500 "
                          aria-hidden="true"
                        />
                      ) : (
                        <XCircleIcon
                          className="h-12 w-5 text-red-500"
                          aria-hidden="true"
                        />
                      )}
                    </td>

                    <td className="py-2 text-center border dark:border-neutral-700">
                      <div className="flex items-center justify-evenly">
                        {/* Update Button */}
                        <button
                          className="text-blue-500 hover:underline  flex items-center"
                          onClick={() => handleUpdate(product)}>
                          <PencilSquareIcon
                            aria-hidden="true"
                            className="h-5 w-5"
                          />
                        </button>

                        {/* Out of Stock Button */}
                        <div className="">
                          <button
                            onClick={() => handleStockClick(product)}
                            className="focus:outline-none flex items-center">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                          </button>
                        </div>

                        {/* Delete Button */}
                        <div className="">
                          <button
                            type="button"
                            className="-m-2.5 flex items-center justify-center text-red-500 hover:text-gray-500"
                            onClick={() =>
                              handleDeleteClick(product.productId)
                            }>
                            <span className="sr-only">Remove</span>
                            <TrashIcon aria-hidden="true" className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Confirmation Popup */}
                        {showPopup && (
                          <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="relative rounded-lg">
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>
                              <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10">
                                <p>
                                  Are you sure you want to delete this product?
                                </p>
                                <div className="flex justify-end mt-4">
                                  <button
                                    className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                                    onClick={() =>
                                      handleConfirmDelete(product.productId)
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

                        {/* Stock Modal */}
                        {isStockModalOpen && selectedStockProduct && (
                          <div className="fixed inset-0 flex items-center justify-center z-50">
                            <div className="relative rounded-lg w-full max-w-md mx-auto">
                              {/* Background Blur */}
                              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-md"></div>

                              {/* Modal Content */}
                              <div className="bg-white dark:bg-black rounded-lg shadow-lg p-6 relative z-10">
                                <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                                  <strong>{selectedStockProduct.name}</strong>{" "}
                                  is{" "}
                                  {selectedStockProduct.stock ? (
                                    <span className="text-green-500">
                                      In Stock
                                    </span>
                                  ) : (
                                    <span className="text-red-500">
                                      Out of Stock
                                    </span>
                                  )}
                                </p>

                                {/* Styled Dropdown */}
                                <div className="mb-6">
                                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Update Stock Status
                                  </label>
                                  <select
                                    className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#ffc107] focus:border-transparent"
                                    value={
                                      selectedStockProduct.stock
                                        ? "true"
                                        : "false"
                                    }
                                    onChange={(e) =>
                                      handleDropdownChange(e.target.value)
                                    }>
                                    <option value="true">In Stock</option>
                                    <option value="false">Out of Stock</option>
                                  </select>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-evenly gap-5">
                                  <button
                                    className="bg-[#ffc107] hover:bg-[#ffb800] text-gray-700 px-4 py-2 rounded-lg transition"
                                    onClick={updateStockInBackend}>
                                    Update
                                  </button>
                                  <button
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition"
                                    onClick={closeStockModal}>
                                    Close
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination buttons inside the table */}
            {selectedCategory && products.length > 0 && (
              <div className="flex justify-center mt-4 mb-3">
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`px-4 py-2 mx-1 ${
                      currentPage === index + 1
                        ? "bg-[#e8126aff] text-white"
                        : "bg-gray-300"
                    } rounded-lg`}
                    onClick={() => handlePageChange(index + 1)}>
                    {index + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center items-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Update Modal */}
        {isModalOpen && (
          <UpdateProductModal
            product={selectedProduct}
            onClose={handleModalClose}
            onProductUpdated={handleProductUpdated}
          />
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
