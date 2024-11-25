"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import ReviewForm from "@/client/components/ReviewForm";
import { Label } from "@/client/components/ui/label";
import { Input } from "@/client/components/ui/input";
import { cn } from "@/client/utils/cn";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function AddReviews() {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  console.log(selectedProduct);
  
  // Debounce the search term so that the API is only called after the user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Delay of 300ms

    // Cleanup function to clear the timeout if the user types within the delay period
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (debouncedSearchTerm.length > 0) {
        try {
          const response = await axios.get(
            `/api/products/${debouncedSearchTerm}`
          );
          setSearchResults([response.data]);
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
    setSearchResults([]); // Hide the dropdown after selection
  };

  const [formData, setFormData] = useState({
    category: "",
    name: "",
    price: "",
    oldPrice: "",
    description: "",
    image: null,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({
        ...formData,
        image: files[0], // Assign the first file (assuming single file upload)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
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

      // Send product data to backend
      const response = await axios.post(
        "/api/products?controllerName=addReview",
        productData
      );

      toast.success(response.data.message, {
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
    } catch (error) {
      toast.error("Error adding product.");
    }
  };

  return (
    <div className="flex flex-1">
      <div
        className="p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700
     bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1 w-full h-full md:overflow-y-auto overflow-y-auto ">
        <div className="w-full max-w-3xl mx-auto p-4 md:p-8 shadow-input bg-white dark:bg-black rounded-lg ">
          <h2 className="text-2xl font-semibold text-black dark:text-white text-center py-3">
            Add Review
          </h2>
          <div>
            <LabelInputContainer className="flex-1">
              <Label htmlFor="searchProduct">Search Product</Label>
              <Input
                name="searchProduct"
                placeholder="Search Product"
                type="text"
                value={searchTerm} // Bind value to searchTerm state
                onChange={(e) => setSearchTerm(e.target.value)} // Handle input change
                required
              />
              {/* Dropdown for search results */}
              {searchResults.length > 0 && (
                <ul className=" z-20">
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
                      {/* Display product image */}

                      {/* Display product details */}
                      <div className="flex gap-5">
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={100} // Small width
                          height={50} // Small height
                          className="object-cover rounded-full " // Fully rounded image
                        />

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
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Show the review form when a product is selected */}
              {selectedProduct && (
                <div>
                  <h2>Selected Product: {selectedProduct.name}</h2>
                  {/* Pass selected productId to the review form */}
                </div>
              )}
            </LabelInputContainer>
          </div>
          <form className="my-8" onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="image">User Image</Label>
                <Input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="price">User Name</Label>
                <Input
                  name="price"
                  placeholder="User Name"
                  type="text"
                  required
                  value={formData.price} // Bind value to state
                  onChange={handleInputChange}
                />
              </LabelInputContainer>
              <LabelInputContainer className="flex-1">
                <Label htmlFor="Old Price">Rating</Label>
                <Input
                  name="oldPrice"
                  placeholder="Rating"
                  type="number"
                  value={formData.oldPrice} // Bind value to state
                  onChange={handleInputChange}
                  required
                />
              </LabelInputContainer>
            </div>

            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-4">
              <LabelInputContainer className="flex-1">
                <Label htmlFor="description">Comment</Label>
                <textarea
                  name="description"
                  placeholder="Product Comment"
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

            <button
              className="bg-gradient-to-br relative group/btn from-black dark:from-zinc-900 dark:to-zinc-900 to-neutral-600 block dark:bg-zinc-800 w-full text-white rounded-md h-10 font-medium shadow-[0px_1px_0px_0px_#ffffff40_inset,0px_-1px_0px_0px_#ffffff40_inset] dark:shadow-[0px_1px_0px_0px_var(--zinc-800)_inset,0px_-1px_0px_0px_var(--zinc-800)_inset]"
              type="submit">
              Add Review &rarr;
              <BottomGradient />
            </button>
          </form>
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
