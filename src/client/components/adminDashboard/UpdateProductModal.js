"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import config from "@/config";
import { cn } from "@/client/utils/cn";
import { _put } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import toast, { Toaster } from "react-hot-toast";

export default function UpdateProductModal({
  product,
  onClose,
  onProductUpdated,
}) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(product.price);
  const [oldPrice, setOldPrice] = useState(product.oldPrice);
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [quantity, setQuantity] = useState(product.quantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      let updatedImageUrl = imageUrl;

      // Upload image to Cloudinary if a new image is selected
      if (selectedImage) {
        const imageFormData = new FormData();
        imageFormData.append("file", selectedImage);
        imageFormData.append("upload_preset", "e-commerce");
        imageFormData.append("folder", "e-commerce");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dwdqhkpk4/image/upload",
          imageFormData
        );

        updatedImageUrl = response.data.secure_url;
      }

      // Prepare product data for update
      const productData = {
        name,
        description,
        price,
        oldPrice,
        imageUrl: updatedImageUrl,
        quantity,
      };

      // Send product data to the backend
      const apiResponse = await _put("/api/admin", {
        controllerName: "updateProduct",
        productId: product.productId,
        productData,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (apiResponse.status === 200) {
        toast.success(response.message);
        onProductUpdated();
        onClose();
      } else {
        toast.error("update product Failed");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center">
      <div
        className="bg-black text-white p-6 rounded-lg shadow-lg flex w-3/4 h-[400px]"
        style={{ boxShadow: "0 4px 15px rgba(255, 255, 0, 0.6)" }}>
        {/* Image Section */}
        <div className="flex justify-center items-center w-1/2 p-4 h-full">
          <Image
            src={imageUrl}
            alt={name}
            width={100}
            height={100}
            className="object-cover h-80 w-80 rounded-lg"
            draggable="false"
          />
        </div>

        {/* Form Section */}
        <div className="flex-grow p-4 h-full overflow-y-auto">
          <h2 className="text-2xl mb-4 text-center">Update Product</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <LabelInputContainer>
              <Label htmlFor="name">Name</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-gray-700 bg-[#27272aff] text-white p-2 rounded w-full"
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4">
            <LabelInputContainer>
              <Label htmlFor="description">Description</Label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border border-gray-700 bg-[#27272aff] text-white p-2 rounded w-full"
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4">
            <LabelInputContainer>
              <Label htmlFor="price">Price</Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border border-gray-700 bg-[#27272aff] text-white p-2 rounded w-full"
              />
            </LabelInputContainer>
          </div>

          <div className="mb-4">
            <LabelInputContainer>
              <Label htmlFor="oldPrice">Old Price</Label>
              <Input
                type="number"
                value={oldPrice}
                onChange={(e) => setOldPrice(e.target.value)}
                className="border border-gray-700 bg-[#27272aff] text-white p-2 rounded w-full"
              />
            </LabelInputContainer>
          </div>

          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
            <LabelInputContainer>
              <Label htmlFor="image">Product Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="block w-full px-3 py-2  bg-[#27272aff] rounded-md text-white 
                focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </LabelInputContainer>

            {/* Display image preview */}
            {imagePreview && (
              <div className="relative">
                <Image
                  src={imagePreview}
                  alt="Image Preview"
                  width={100}
                  height={100}
                  className="object-cover rounded-md"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setSelectedImage(null);
                  }}
                  className="absolute top-0 right-1 bg-red-500 text-white ">
                  &times;
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded mr-2 hover:bg-gray-500"
              onClick={onClose}>
              Cancel
            </button>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-500"
              onClick={handleUpdate}
              disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
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
