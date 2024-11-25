"use client";

import React, { Fragment, useState, useEffect, Suspense } from "react";
import Image from "next/image";
import axios from "axios";
import CryptoJS from "crypto-js";
import Link from "next/link";
import Slider from "react-slick";
import config from "@/config";
import ProductImageZoom from "./productImageZoom";
import { _get, _post, _delete } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { addToCart } from "@/client/store/nextSlice";
import { StarIcon } from "@heroicons/react/20/solid";
import { AiOutlineHeart, AiFillHeart, AiOutlineStar } from "react-icons/ai";
import { HeartIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "@/client/components/codeSplit/2_home/homeComponents.css";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Radio,
  RadioGroup,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import toast, { Toaster } from "react-hot-toast";

const dummyProduct = {
  name: "Zip Tote Basket",
  price: "$140",
  rating: 4,
  images: [
    {
      id: 1,
      name: "Angled view",
      src: "https://tailwindui.com/img/ecommerce-images/product-page-03-product-01.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    {
      id: 2,
      name: "Angled view",
      src: "https://tailwindui.com/img/ecommerce-images/product-page-03-product-02.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    {
      id: 3,
      name: "Angled view",
      src: "https://tailwindui.com/img/ecommerce-images/product-page-03-product-03.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    {
      id: 4,
      name: "Angled view",
      src: "https://tailwindui.com/img/ecommerce-images/product-page-03-product-04.jpg",
      alt: "Angled front view with bag zipped and handles upright.",
    },
    // More images...
  ],
  colors: [
    {
      name: "Washed Black",
      bgColor: "bg-gray-700",
      selectedColor: "ring-gray-700",
    },
    { name: "White", bgColor: "bg-white", selectedColor: "ring-gray-400" },
    {
      name: "Washed Gray",
      bgColor: "bg-gray-500",
      selectedColor: "ring-gray-500",
    },
  ],

  details: [
    {
      name: "Features",
      items: [
        "Product reviews and ratings to help customers make informed decisions.",
      ],
    },
    {
      name: "Cares",
      items: [
        "Dedicated customer support available 24/7.",
        "Easy returns and exchanges for a hassle-free shopping experience.",
        "Privacy protection for customer data with encrypted transactions.",
      ],
    },
    {
      name: "Shipping",
      items: [
        "Same-day delivery.",
        "Express shipping options available for urgent deliveries.",
        "Order tracking available for all shipments.",
        "Gift wrapping available for special occasions.",
      ],
    },
    // More sections...
  ],
};

const faqs = [
  {
    question: "What format are these icons?",
    answer:
      "The icons are in SVG (Scalable Vector Graphic) format. They can be imported into your design tool of choice and used directly in code.",
  },
  {
    question: "Can I use the icons at different sizes?",
    answer:
      "Yes. The icons are drawn on a 24 x 24 pixel grid, but the icons can be scaled to different sizes as needed. We don't recommend going smaller than 20 x 20 or larger than 64 x 64 to retain legibility and visual balance.",
  },
  // More FAQs...
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

function SingleProductPageContent() {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [customerLikeProduct, setCustomerLikeProduct] = useState([]);
  const [reviews, setReviews] = useState([]);
  const searchParams = useSearchParams();
  const encryptedProductId = searchParams.get("p");
  const [category, setCategory] = useState("");
  const [productName, setProductName] = useState("");
  const [inStock, setInStock] = useState();

  // Function to decrypt the productId
  const decryptId = (encryptedId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    const bytes = CryptoJS.AES.decrypt(encryptedId, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const apiResponse = await _get(`/api/products`, {
          controllerName: "getReviewsByProduct",
          productId: product?.productId,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        const fetchedReviews = response.reviews;
        setReviews(fetchedReviews);

        setLoading(false);
      } catch (error) {
        setError("Error fetching reviews. Please try again later.");
        setLoading(false);
      }
    };

    if (product?.productId) {
      fetchReviews();
    }
  }, [product?.productId]);

  useEffect(() => {
    // Fetch the product from the API
    async function fetchProduct() {
      const productId = decryptId(encryptedProductId);
      if (productId) {
        try {
          const apiResponse = await _get(`/api/products/${productId}`);

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          setInStock(response.stock);
          setCategory(response.category);
          setProductName(response.name);
          setProduct(response);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            router.push("/not-found");
          }
        } finally {
          setLoading(false);
        }
      }
    }

    if (encryptedProductId) {
      fetchProduct();
    }
  }, [encryptedProductId]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const apiResponse = await _get(`/api/products`, {
          controllerName: "getRandomProducts",
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        setCustomerLikeProduct(response.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    fetchProducts();
  }, []);

  const settings = {
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    centerMode: true,
    autoplay: true,
    autoplaySpeed: 3000,
    centerPadding: "180px",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          centerPadding: "100px",
        },
      },
      {
        breakpoint: 768, // For mobile devices
        settings: {
          slidesToShow: 1,
          centerPadding: "50px",
        },
      },
    ],
  };

  const handleAddToCart = async (product) => {
    if (!session) {
      router.push("/auth");
    } else {
      try {
        const apiResponse = await _post(`/api/products/cart`, {
          controllerName: "addProductToCart",
          productId: product.productId,
          imageUrl: product.imageUrl,
          category: product.category,
          name: product.name,
          price: product.price,
          oldPrice: product.oldPrice,
          stock: product.stock,
          description: product.description,
          quantity: 1,
          email: session.user?.email,
        });

        const response = config.isProduction
          ? decryptData(apiResponse.encrypt)
          : apiResponse.encrypt;

        if (apiResponse.status === 200) {
          const { alreadyAdded } = response;
          dispatch(addToCart(product));

          if (alreadyAdded) {
            toast.error(`${product.name} is already in the cart`);
          } else {
            toast.success(`${product.name} added to cart`);
          }
        } else {
          toast.error("Failed to add product to cart");
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "An error occurred while adding to cart"
        );
      }
    }
  };

  useEffect(() => {
    const handleGetFavorite = async () => {
      if (session && session.user) {
        // Ensure session and user exist before making the API call
        try {
          const apiResponse = await _get(`/api/visitor`, {
            controllerName: "getFavorite",
            email: session.user.email,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          // Store the favorite product IDs in state
          const favoriteProducts = response.favorite.map(
            (item) => item.productId
          );
          setFavorites(favoriteProducts);
        } catch (error) {
          toast.error(
            error.response?.data?.message ||
              "An error occurred while fetching the favorites"
          );
        }
      }
    };

    handleGetFavorite();
  }, [session]); // session is the dependency

  const handleFavoriteBtn = async (event, product) => {
    event.preventDefault();
    if (!session) {
      router.push("/auth");
    } else {
      try {
        const email = session.user?.email;

        if (favorites.includes(product.productId)) {
          // Remove from favorites
          const apiResponse = await _delete(`/api/visitor`, {
            controllerName: "removeProductFromFavorite",
            email: email,
            productId: product.productId,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          if (apiResponse.status === 200) {
            setFavorites((prevFavorites) =>
              prevFavorites.filter((favId) => favId !== product.productId)
            );
            toast.success(`${product.name} removed from favorites`);
          } else {
            toast.error("Failed to remove product from favorites");
          }
        } else {
          // Add to favorites
          const apiResponse = await _post("/api/visitor", {
            controllerName: "addProductToFavorite",
            productId: product.productId,
            imageUrl: product.imageUrl,
            category: product.category,
            name: product.name,
            price: product.price,
            oldPrice: product.oldPrice,
            description: product.description,
            email: email,
          });

          const response = config.isProduction
            ? decryptData(apiResponse.encrypt)
            : apiResponse.encrypt;

          if (apiResponse.status === 200) {
            const { alreadyAdded } = response;

            if (alreadyAdded) {
              toast.error(`${product.name} is already in your favorites`);
            } else {
              setFavorites((prevFavorites) => [
                ...prevFavorites,
                product.productId,
              ]);
              toast.success(`${product.name} added to favorites`);
            }
          } else {
            toast.error("Failed to add product to favorites");
          }
        }
      } catch (error) {
        toast.error(
          error.response?.message ||
            "An error occurred while adding/removing favorites"
        );
      }
    }
  };

  const handleCategoryClick = () => {
    router.push(`/products?category=${category}`);
  };

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="bg-white dark:bg-black dark:text-white pt-12">
      <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8 ">
        <ol className="flex items-center pt-16 md:pt-0 px-2">
          <li>
            <Link
              href="/"
              className="mr-1 text-sm font-bold text-gray-900 dark:text-white">
              Home
            </Link>
            <span style={{ color: "#e8126aff" }}> &gt; </span>{" "}
            <span className="mr-1  text-sm font-bold text-gray-900 dark:text-white">
              <Link
                href={`/products?category=${category}`}
                passHref
                className="cursor-pointer">
                {category || "category Products"}
              </Link>
            </span>{" "}
            <span style={{ color: "#e8126aff" }}> &gt; </span>{" "}
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {productName || "Product Name"}
            </span>
          </li>
        </ol>
        <div className="mx-auto max-w-2xl lg:max-w-none pt-4">
          {/* Product */}
          <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8 ">
            {/* Image gallery */}
            <TabGroup className="flex flex-col-reverse">
              {/*************************************** Image selector **********************************/}

              {/*   <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
                <TabList className="grid grid-cols-4 gap-6">
                  {dummyProduct.images.map((image) => (
                    <Tab
                      key={image.id}
                      className="group relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase text-gray-900 hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4">
                      <span className="sr-only">{image.name}</span>
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        <Image
                          alt=""
                          src={image.src}
                          className="h-full w-full object-cover object-center"
                          height={100}
                          width={100}
                          draggable={false}
                        />
                      </span>
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 rounded-md ring-2 ring-transparent ring-offset-2
                         group-data-[selected]:ring-yellow-400"
                      />
                    </Tab>
                  ))}
                </TabList>
              </div> */}

              <TabPanels className="aspect-h-1 aspect-w-1 w-full">
                <TabPanel
                  key={product._id}
                  className="flex justify-center items-center mx-auto h-96 w-full sm:w-96">
                  <ProductImageZoom product={product} />
                </TabPanel>
              </TabPanels>
            </TabGroup>

            {/* Product info */}
            <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white capitalize">
                {product.name}
              </h1>

              <div className="mt-3 flex gap-3">
                <h2 className="sr-only">Product information</h2>
                <p className="text-3xl tracking-tight text-gray-900 dark:text-white">
                  ₹ {product.price}
                </p>
                <p className="text-3xl tracking-tight text-gray-900 ">
                  <del className="text-gray-400"> ₹ {product.oldPrice}</del>
                </p>
              </div>

              {/* Reviews */}
              <div className="mt-3">
                <h3 className="sr-only">Reviews</h3>
                <div className="flex items-center">
                  {/* Star Rating */}
                  <div className="flex items-center">
                    {/* Loop through 0 to 4 to display 5 stars */}
                    {[0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon
                        key={rating}
                        aria-hidden="true"
                        className={classNames(
                          product.rating > rating // Check if the current star index is less than the product rating
                            ? "text-[#ffc107ff]" // Star color for rated
                            : "text-gray-300", // Star color for un-rated
                          "h-5 w-5 flex-shrink-0"
                        )}
                      />
                    ))}
                    <span className="ml-2 text-gray-700 text-lg">
                      ({product.ratingsCount})
                    </span>{" "}
                  </div>

                  <p className="sr-only">{product.rating} out of 5 stars</p>
                </div>
              </div>

              <p className={inStock ? "text-green-500" : "text-red-500"}>
                {inStock ? "*In Stock" : "*Out of Stock"}
              </p>

              <div className="mt-6">
                <h3 className="sr-only">Description</h3>

                <div
                  dangerouslySetInnerHTML={{ __html: product.description }}
                  className="space-y-6 text-base text-gray-700"
                />
              </div>

              <form className="mt-6">
                {/* Colors */}
                {/* <div>
                  <h3 className="text-sm text-gray-600">Color</h3>
                  <fieldset aria-label="Choose a color" className="mt-2">
                    <RadioGroup
                      value={selectedColor}
                      onChange={setSelectedColor}
                      className="flex items-center space-x-3">
                      {dummyProduct.colors.map((color) => (
                        <Radio
                          key={color.name}
                          value={color}
                          aria-label={color.name}
                          className={classNames(
                            color.selectedColor,
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none data-[checked]:ring-2 data-[focus]:data-[checked]:ring data-[focus]:data-[checked]:ring-offset-1"
                          )}>
                          <span
                            aria-hidden="true"
                            className={classNames(
                              color.bgColor,
                              "h-8 w-8 rounded-full border border-black border-opacity-10"
                            )}
                          />
                        </Radio>
                      ))}
                    </RadioGroup>
                  </fieldset>
                </div> */}

                <div className="mt-10 flex gap-4">
                  <button
                    type="button"
                    className="flex max-w-xs flex-1 items-center justify-center rounded-md border border-transparent
  bg-[#ffc107ff] px-8 py-3 text-base font-medium text-white hover:bg-[#e8126aff]
  focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-50 sm:w-full"
                    onClick={() => handleAddToCart(product)}>
                    Add to Cart
                  </button>

                  <button
                    onClick={(event) => handleFavoriteBtn(event, product)}
                    className="top-2 right-2 text-5xl text-red-500">
                    {favorites.includes(product.productId) ? (
                      <AiFillHeart />
                    ) : (
                      <AiOutlineHeart />
                    )}
                  </button>
                </div>
              </form>

              <section aria-labelledby="details-heading" className="mt-12">
                <h2 id="details-heading" className="sr-only">
                  Additional details
                </h2>

                <div className="divide-y divide-gray-200 border-t">
                  {dummyProduct.details.map((detail) => (
                    <Disclosure key={detail.name} as="div">
                      <h3>
                        <DisclosureButton className="group relative flex w-full items-center justify-between py-6 text-left">
                          <span className="text-sm font-medium text-gray-900 dark:text-white group-data-[open]:text-[#ffc107ff]">
                            {detail.name}
                          </span>
                          <span className="ml-6 flex items-center">
                            <PlusIcon
                              aria-hidden="true"
                              className="block h-6 w-6 text-gray-400 group-hover:text-gray-500 group-data-[open]:hidden"
                            />
                            <MinusIcon
                              aria-hidden="true"
                              className="hidden h-6 w-6 text-[#ffc107ff] group-hover:text-[#ffc107ff] group-data-[open]:block"
                            />
                          </span>
                        </DisclosureButton>
                      </h3>
                      <DisclosurePanel className="prose prose-sm pb-6">
                        <ul role="list" className="list-disc pl-5 space-y-2">
                          {detail.items.map((item) => (
                            <li key={item} className="text-gray-700 text-base">
                              {item}
                            </li>
                          ))}
                        </ul>
                      </DisclosurePanel>
                    </Disclosure>
                  ))}
                </div>
              </section>
            </div>
          </div>

          <div className="mx-auto mt-24 w-full max-w-2xl lg:col-span-4 lg:mt-4 sm:mt-0 lg:max-w-none">
            <TabGroup>
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8">
                  <Tab
                    className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium
                   text-gray-700 hover:border-gray-300 hover:text-gray-800 data-[selected]:border-yellow-400 data-[selected]:text-yellow-400">
                    Customer Reviews
                  </Tab>
                  <Tab
                    className="whitespace-nowrap border-b-2 border-transparent py-6 text-sm font-medium
                   text-gray-700 hover:border-gray-300 hover:text-gray-800 data-[selected]:border-yellow-400 data-[selected]:text-yellow-400">
                    FAQ
                  </Tab>
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                <TabPanel className="-mb-10">
                  <h3 className="sr-only">Customer Reviews</h3>

                  {reviews.map((review, reviewIdx) => (
                    <div
                      key={review._id}
                      className="flex space-x-4 text-sm text-gray-500">
                      <div className="flex-none py-10">
                        {/* Placeholder image if no avatar is provided */}
                        <Image
                          alt="User avatar"
                          src={review.userImage}
                          className="h-10 w-10 rounded-full bg-gray-100"
                          height={100}
                          width={100}
                        />
                      </div>
                      <div
                        className={classNames(
                          reviewIdx === 0 ? "" : "border-t border-gray-200",
                          "flex-1 py-10"
                        )}>
                        {/* Display user ID or author name */}
                        <h3 className="font-medium text-gray-900">
                          {review.userName}
                          {/* Replace with real user data if available */}
                        </h3>

                        {/* Display the star rating */}
                        <div className="mt-1 flex items-center">
                          {[0, 1, 2, 3, 4].map((rating) => (
                            <StarIcon
                              key={rating}
                              aria-hidden="true"
                              className={classNames(
                                review.rating > rating
                                  ? "text-yellow-400"
                                  : "text-gray-300",
                                "h-5 w-5 flex-shrink-0"
                              )}
                            />
                          ))}
                        </div>
                        <p className="sr-only">
                          {review.rating} out of 5 stars
                        </p>

                        {/* Display the review comment */}
                        <p className="prose prose-sm mt-4 max-w-none text-gray-500">
                          {review.reviewText}
                        </p>
                      </div>
                    </div>
                  ))}
                </TabPanel>

                <TabPanel className="text-sm text-gray-500">
                  <h3 className="sr-only">Frequently Asked Questions</h3>

                  <dl>
                    {faqs.map((faq) => (
                      <Fragment key={faq.question}>
                        <dt className="mt-10 font-medium text-gray-900">
                          {faq.question}
                        </dt>
                        <dd className="prose prose-sm mt-2 max-w-none text-gray-500">
                          <p>{faq.answer}</p>
                        </dd>
                      </Fragment>
                    ))}
                  </dl>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </div>

          <section
            aria-labelledby="related-heading"
            className="mt-10 border-t border-gray-200 px-4 py-16 sm:px-0 overflow-x-hidden">
            <h2
              id="related-heading"
              className="text-xl font-bold text-gray-900 dark:text-white ">
              Customers also bought
            </h2>

            <div className=" mt-10">
              <Slider {...settings}>
                {customerLikeProduct.map((product) => (
                  <div
                    key={product._id}
                    className="flex flex-col w-64 overflow-x-hidden ">
                    {/* Maintain gap */}
                    <div className="relative w-64 ">
                      <Link
                        href={{
                          pathname: "/product-category",
                          query: { p: encryptId(product.productId) },
                        }}>
                        <div className="relative h-48 overflow-hidden rounded-lg z-10">
                          <Image
                            alt={product.name}
                            src={product.imageUrl}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            width={200}
                            height={200}
                          />
                          <button
                            onClick={(event) =>
                              handleFavoriteBtn(event, product)
                            }
                            className="absolute top-2 right-2 text-4xl text-red-500">
                            {favorites.includes(product.productId) ? (
                              <AiFillHeart />
                            ) : (
                              <AiOutlineHeart />
                            )}
                          </button>
                        </div>
                      </Link>

                      <div className="relative mt-2">
                        <h3 className="text-sm font-medium  text-white">
                          {product.name}
                        </h3>
                        <div className="flex gap-3">
                          <p className="mt-1 text-sm text-gray-500">
                            ₹ {product.price}
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            <del>₹ {product.oldPrice}</del>
                          </p>
                        </div>
                        <h3 className="text-sm font-medium text-white">
                          {product.description}
                        </h3>
                      </div>

                      <div className="absolute inset-x-0 top-0 flex h-48 items-end justify-end overflow-hidden rounded-lg p-4">
                        <div
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black opacity-50"
                        />
                        {/* Price positioning at bottom-right */}
                        <p className="absolute bottom-2 right-2 text-md font-semibold text-black bg-slate-400 rounded-lg px-2 py-1 z-10">
                          ₹ {product.price}
                        </p>
                      </div>

                      <div className="m-8">
                        <a
                          href={product.href}
                          className="relative flex items-center justify-center rounded-md border border-transparent bg-[#ffc107ff] px-4 
      py-2 text-sm font-semibold hover:bg-[#e8126aff] text-white"
                          onClick={() => handleAddToCart(product)}>
                          Add to Cart
                          <span className="sr-only">, {product.name}</span>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </section>
        </div>
      </main>
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

export default function SingleProductPage() {
  return (
    <Suspense fallback={<p>Loading ...</p>}>
      <SingleProductPageContent />
    </Suspense>
  );
}
