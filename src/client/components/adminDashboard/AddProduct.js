"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import config from "@/config";
import { cn } from "@/client/utils/cn";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { _get, _post, _put, _delete } from "@/client/utils/apiClient";
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/20/solid";
import toast, { Toaster } from "react-hot-toast";

export default function AddProduct() {
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files, type } = e.target;

    // Only update the selectedCategory when the dropdown is changed
    if (type === "select-one") {
      setSelectedCategory(value);
    }

    if (name === "image") {
      const selectedImage = files[0];
      setFormData({
        ...formData,
        // image: files[0], // Assign the first file (assuming single file upload)
        image: selectedImage,
      });
      setImagePreview(URL.createObjectURL(selectedImage));
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const apiResponse = await _get(`/api/admin`, {
          controllerName: "getCategories",
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        setCategories(response.categories);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryAction = async (action, category) => {
    const categoryName = category.name;

    try {
      // Perform the add, update, or delete category API action here based on action parameter
      let response;
      if (action === "add") {
        const apiResponse = await _post(`/api/admin`, {
          controllerName: "addCategory",
          name: "categoryName",
        });

        response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        toast.success(response.message);

        // Append the newly added category to the state
        setCategories((prevCategories) => [
          ...prevCategories,
          { _id: response.categoryId, name: categoryName },
        ]);
      } else if (action === "update") {
        const apiResponse = await _put(`/api/admin`, {
          controllerName: "updateCategory",
          name: categoryName,
        });

        response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        if (apiResponse.status === 200) {
          toast.success(response.message);
        } else {
          toast.error(error.message);
        }
      } else if (action === "delete") {
        setCategoryToDelete(category);
        setShowPopup(true);
        return;
      }

      setCategoryName("");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Error performing category action.");
    }
  };

  const handleConfirmDelete = async () => {
    if (categoryToDelete) {
      try {
        const apiResponse = await _delete(`/api/admin`, {
          controllerName: "deleteCategory",
          name: categoryToDelete.name,
        });

        console.log(apiResponse);

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        console.log(response);

        toast.success(`${response.message}`);

        // Remove the deleted category from the state
        setCategories((prevCategories) =>
          prevCategories.filter((cat) => cat.name !== categoryToDelete.name)
        );
        setShowPopup(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast.error("Error deleting category.");
      }
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
    setCategoryToDelete(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Upload image to Cloudinary if an image is selected
      let imageURL = null;
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.image);
        imageFormData.append("upload_preset", "e-commerce"); // Keep the preset
        imageFormData.append("folder", "e-commerce"); // Specify the folder here

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dwdqhkpk4/image/upload",
          imageFormData
        );

        imageURL = response.data.secure_url;
      }

      // Prepare product data
      const productData = {
        category: formData.category,
        name: formData.name,
        price: formData.price,
        oldPrice: formData.oldPrice,
        description: formData.description,
        image: imageURL, // Use the Cloudinary image URL if available
      };

      const apiResponse = await _post(`/api/products`, {
        controllerName: "addProduct",
        productData: productData,
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
        category: "",
        name: "",
        price: "",
        oldPrice: "",
        description: "",
        image: null,
      });

      setSelectedCategory("");
      setImagePreview(null);
    } catch (error) {
      toast.error("Error adding product.");
    }
  };

  return (
    <div className="flex flex-1 h-full">
      <div
        className="p-2 rounded-tl-2xl 
     bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full  overflow-y-auto ">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 shadow-input bg-[#27272aff] dark:bg-black rounded-lg ">
          <div className="flex justify-evenly">
            <h2 className="font-bold text-xl text-[#e8126aff] text-center underline underline-offset-4 ">
              Add Product
            </h2>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900
               dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-52 text-[#e8126aff]
                rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset]
                 dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="button">
              Update Category &rarr;
              <BottomGradient />
            </button>
          </div>

          <form className="my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="category"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Category
                </Label>
                <select
                  id="category"
                  name="category"
                  className="block w-full px-3 py-2 border border-gray-800 bg-white dark:bg-black 
                 dark:text-white text-black rounded-md focus:outline-none focus:ring-2
                 focus:ring-blue-500 hover:bg-white hover:text-black overflow-y-auto"
                  value={selectedCategory}
                  onChange={handleInputChange}>
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="ProductName"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Product Name
                </Label>
                <Input
                  name="name"
                  placeholder="Product Name"
                  type="text"
                  required
                  value={formData.name} // Bind value to state
                  onChange={handleInputChange}
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="price"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Price
                </Label>
                <Input
                  name="price"
                  placeholder="Price"
                  type="number"
                  required
                  value={formData.price} // Bind value to state
                  onChange={handleInputChange}
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="Old Price"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Old Price
                </Label>
                <Input
                  name="oldPrice"
                  placeholder="Old Price"
                  type="number"
                  value={formData.oldPrice} // Bind value to state
                  onChange={handleInputChange}
                  required
                />
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="description"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Description
                </Label>
                <textarea
                  name="description"
                  placeholder="Product Description"
                  className="block w-full px-3 py-2 border border-gray-800 bg-white dark:bg-black 
                  dark:text-white  text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500
                   hover:bg-white"
                  rows="4"
                  value={formData.description} // Bind value to state
                  onChange={handleInputChange}
                  required
                />
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label
                  htmlFor="image"
                  className="text-[#ffc107ff] dark:text-[#ffc107ff]">
                  Product Image
                </Label>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="block w-full px-3 text-[#ffc107ff] dark:text-[#ffc107ff] py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </LabelInputContainer>

              {/* Display image preview */}
              {imagePreview && (
                <div className="mt-2 relative">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-md"
                  />
                  {/* Close icon to remove the selected image */}
                  <button
                    onClick={() => {
                      setImagePreview(null);
                      setFormData((prev) => ({ ...prev, image: null }));
                    }}
                    className="absolute top-0 right-1 bg-red-500 text-white ">
                    &times;
                  </button>
                </div>
              )}
            </div>

            <button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-[#ffc107ff] rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit">
              Add Product &rarr;
              <BottomGradient />
            </button>
          </form>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          {/* Outer gradient border */}
          <div className="relative rounded-lg">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>

            {/* Inner modal content */}
            <div className="relative bg-white dark:bg-black p-6 rounded-lg w-full max-w-md z-10 shadow-lg">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-5 right-2 text-black dark:text-red-400 text-2xl font-bold hover:underline">
                &times;
              </button>

              <h3 className="text-lg font-bold mb-4">Manage Categories</h3>

              {/* Categories Table */}
              <div className="overflow-x-auto shadow-md rounded-lg mb-4">
                <div className="max-h-64 overflow-y-auto">
                  {" "}
                  {/* Set a max height and enable vertical scrolling */}
                  <table className="min-w-full table-auto bg-white dark:bg-neutral-800 border-gray-300 dark:border-neutral-700">
                    <thead className="bg-gray-50 dark:bg-neutral-800">
                      <tr className="bg-gray-200 dark:bg-neutral-700 text-center">
                        <th className="px-4 py-3 text-sm border border-gray-700 text-[#ffc107ff]">
                          No:
                        </th>
                        <th className="px-4 py-3 text-sm border border-gray-700 text-[#ffc107ff]">
                          Category Name
                        </th>
                        <th className="px-4 py-3 text-sm border border-gray-700 text-[#ffc107ff]">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-neutral-900 dark:divide-neutral-600">
                      {categories.map((category, index) => (
                        <tr
                          key={category._id}
                          className="hover:bg-gray-100 dark:hover:bg-neutral-800">
                          <td className="px-6 py-2 border border-gray-700 text-center">
                            {index + 1}
                          </td>
                          <td className="px-6 py-2 border border-gray-700 text-center">
                            {category.name}
                          </td>
                          <td className="px-6 py-2 border border-gray-700 text-center">
                            <button
                              onClick={() =>
                                handleCategoryAction("update", category)
                              }
                              className="text-blue-500 hover:underline mr-4">
                              <PencilSquareIcon
                                aria-hidden="true"
                                className="h-5 w-5"
                              />
                            </button>
                            <button
                              onClick={() =>
                                handleCategoryAction("delete", category)
                              }
                              className="text-red-500 hover:underline">
                              <TrashIcon
                                aria-hidden="true"
                                className="h-5 w-5"
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Input for Adding New Category */}
              <div className="mb-4">
                <LabelInputContainer>
                  <Input
                    name="categoryName"
                    placeholder="Category Name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                  />
                </LabelInputContainer>
              </div>

              <button
                onClick={() =>
                  handleCategoryAction("add", { name: categoryName })
                }
                className=" py-2 px-4 bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]">
                Add Category
                <BottomGradient />
              </button>
            </div>
          </div>
        </div>
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
      {/* Confirmation Popup */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="relative rounded-lg">
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#e8126a] to-[#ffc107] blur-sm"></div>
            <div className="bg-white dark:bg-black rounded-lg shadow-lg p-4 relative z-10">
              <p>Are you sure you want to delete this category?</p>
              <div className="flex justify-end mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                  onClick={handleConfirmDelete}>
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
