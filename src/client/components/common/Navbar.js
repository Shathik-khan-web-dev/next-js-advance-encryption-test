"use client";

import { Fragment, useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import config from "@/config";
import { _get } from "@/client/utils/apiClient";
import { decryptData } from "@/client/utils/encryptDecrypt";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { useSelector } from "react-redux";
import CryptoJS from "crypto-js";
import "./btn.css";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Popover,
  PopoverButton,
  PopoverGroup,
  PopoverPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Bars3Icon,
  ShoppingBagIcon,
  XMarkIcon,
  UserCircleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

const navigation = {
  categories: [
    {
      id: "all-products",
      name: "All Products",
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            {
              name: "Tops",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/clothing.jpg&width=166&cfcache=all",
            },
            {
              name: "Dresses",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/mens-hoodie.jpg&width=166&cfcache=all",
            },
            {
              name: "Pants",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bagpacks-b.jpg&width=166&cfcache=all",
            },
            {
              name: "Denim",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/muffler.jpg&width=166&cfcache=all",
            },
            {
              name: "Sweaters",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/shoes.jpg&width=166&cfcache=all",
            },
            {
              name: "T-Shirts",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/passport-holder1.jpg&width=166&cfcache=all",
            },
            {
              name: "Jackets",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/sleeping-mask.jpg&width=166&cfcache=all",
            },
            {
              name: "Activewear",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/belt.jpg&width=166&cfcache=all",
            },
            {
              name: "Browse All",
              href: "#",
              imgSrc:
                "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/face-mask.jpg&width=166&cfcache=all",
            },
          ],
        },
      ],
    },
    {
      id: "men",
      name: "Men",
      sections: [
        {
          id: "clothing",
          name: "Clothing",
          items: [
            { name: "1", href: "#", imgSrc: "" },
            { name: "2", href: "#", imgSrc: "" },
            { name: "3", href: "#", imgSrc: "" },
            { name: "4", href: "#", imgSrc: "" },
          ],
        },
      ],
    },
  ],
};

// Debounce function
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;
  const { productData } = useSelector((state) => state.next);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [mobileSearchResults, setMobileSearchResults] = useState([]);
  const [desktopSearchQuery, setDesktopSearchQuery] = useState("");
  const [desktopSearchResults, setDesktopSearchResults] = useState([]);
  const mobileSearchRef = useRef(null);
  const desktopSearchRef = useRef(null);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click was outside the sidebar
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setOpen]);

  // Sidebar items click handler
  const handleItemClick = () => {
    setOpen(false);
  };

  // Debounced values for search queries
  const debouncedDesktopSearchQuery = useDebounce(desktopSearchQuery, 1000);
  const debouncedMobileSearchQuery = useDebounce(mobileSearchQuery, 1000);

  // Fetch search results when the debounced desktop query changes
  useEffect(() => {
    if (debouncedDesktopSearchQuery.length >= 3) {
      fetchSearchResults(debouncedDesktopSearchQuery, "desktop");
    } else {
      setDesktopSearchResults([]); // Clear results if the query is shorter than 3 characters
    }
  }, [debouncedDesktopSearchQuery]);

  // Fetch search results when the debounced mobile query changes
  useEffect(() => {
    if (debouncedMobileSearchQuery.length >= 3) {
      fetchSearchResults(debouncedMobileSearchQuery, "mobile");
    } else {
      setMobileSearchResults([]); // Clear results if the query is shorter than 3 characters
    }
  }, [debouncedMobileSearchQuery]);

  // Fetch search results from the server
  const fetchSearchResults = async (searchTerm, device) => {
    try {
      const apiResponse = await _get(`/api/products`, {
        controllerName: "searchProducts",
        searchQuery: searchTerm,
      });

      const response = config.isProduction
        ? decryptData(apiResponse.encrypt)
        : apiResponse.encrypt;

      if (device === "desktop") {
        setDesktopSearchResults(response.products || []);
      } else if (device === "mobile") {
        setMobileSearchResults(response.products || []);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        if (device === "desktop") {
          setDesktopSearchResults([]); // No products found
        } else if (device === "mobile") {
          setMobileSearchResults([]); // No products found
        }
      } else {
        console.error("Error searching products:", error);
      }
    }
  };

  // Close search results and clear search on outside click for mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileSearchRef.current &&
        !mobileSearchRef.current.contains(event.target)
      ) {
        setMobileSearchQuery("");
        setMobileSearchResults([]);
        setShowMobileSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close search results and clear search on outside click for desktop
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        desktopSearchRef.current &&
        !desktopSearchRef.current.contains(event.target)
      ) {
        setDesktopSearchQuery("");
        setDesktopSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const encryptId = (productId) => {
    const secretKey = process.env.NEXT_PUBLIC_CRYPTO_SECRET_KEY;
    return CryptoJS.AES.encrypt(productId, secretKey).toString();
  };

  // dark mode
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  // Check if the theme is dark or light
  const isDark = resolvedTheme === "dark";

  return (
    <div className="bg-white dark:bg-black z-50">
      {/* Mobile menu */}
      <Dialog
        open={open}
        onClose={setOpen}
        className="relative z-50 lg:hidden dark:bg-black mt-44">
        <DialogBackdrop
          transition
          className="fixed inset-0 bg-black bg-opacity-25 transition-opacity duration-300 ease-linear data-[closed]:opacity-0"
        />

        <div className="fixed inset-0 z-40 flex">
          <DialogPanel
            ref={sidebarRef}
            transition
            className="relative flex w-72 max-w-xs transform flex-col overflow-y-auto bg-white
             dark:bg-black pb-12 shadow-xl transition duration-300 ease-in-out data-[closed]:-translate-x-full">
            <div className="flex justify-between px-4 pb-2 pt-5">
              <div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
              <div>
                <label className="theme-switch cursor-pointer">
                  <input
                    type="checkbox"
                    className="theme-switch__checkbox"
                    checked={isDark}
                    onChange={() => setTheme(isDark ? "light" : "dark")}
                  />
                  <div className="theme-switch__container">
                    <div className="theme-switch__clouds"></div>
                    <div className="theme-switch__stars-container">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 144 55"
                        fill="none">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.0551 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z"
                          fill="currentColor"></path>
                      </svg>
                    </div>
                    <div className="theme-switch__circle-container">
                      <div className="theme-switch__sun-moon-container">
                        <div className="theme-switch__moon">
                          <div className="theme-switch__spot"></div>
                          <div className="theme-switch__spot"></div>
                          <div className="theme-switch__spot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div className="border-t border-b border-gray-200 py-3">
              <div>
                {!session ? (
                  <div className="px-4 py-6 flex items-center justify-center">
                    <Link
                      href="/auth"
                      className=" flex items-center p-2"
                      onClick={handleItemClick}>
                      <UserCircleIcon className="h-6 w-6 bg-white dark:bg-black dark:text-white flex-shrink-0" />
                      <span className="ml-3 block text-base font-medium bg-white dark:bg-black dark:text-white">
                        Sign-in or Register
                      </span>
                    </Link>
                  </div>
                ) : (
                  <div onClick={handleItemClick}>
                    {role === "admin" && (
                      <UserDashboardLink
                        href="/dashboard/admin"
                        session={session}
                        onClick={handleItemClick}
                      />
                    )}
                    {role === "employee" && (
                      <UserDashboardLink
                        href="/dashboard/employee"
                        session={session}
                        onClick={handleItemClick}
                      />
                    )}
                    {role === "visitor" && (
                      <UserDashboardLink
                        href="/dashboard/visitor"
                        session={session}
                        onClick={handleItemClick}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Links */}
            <TabGroup className="mt-2">
              <div className="border-b border-gray-200">
                <TabList className="-mb-px flex space-x-8 px-4">
                  {navigation.categories.map((category) => (
                    <Tab
                      key={category.name}
                      className="flex-1 whitespace-nowrap border-b-2 border-transparent px-1 py-4 text-base font-medium text-[#ffc107ff]
                      data-[selected]:border-[#e8126aff] data-[selected]:text-[#e8126aff]">
                      {category.name}
                    </Tab>
                  ))}
                </TabList>
              </div>
              <TabPanels as={Fragment}>
                {navigation.categories.map((category) => (
                  <TabPanel key={category.name} className="space-y-5 px-4">
                    <div className="grid grid-cols-2 gap-x-4"></div>
                    {category.sections.map((section) => (
                      <div key={section.name}>
                        <ul
                          role="list"
                          aria-labelledby={`${category.id}-${section.id}-heading-mobile`}
                          className="mt-6 flex flex-col space-y-6">
                          {section.items.map((item) => (
                            <li key={item.name} className="flow-root">
                              <a
                                href={item.href}
                                className="-m-2 p-2 text-gray-500 flex gap-4 items-center"
                                onClick={handleItemClick}>
                                <Image
                                  src={item.imgSrc}
                                  alt="product image"
                                  width={60}
                                  height={60}
                                  className="border rounded-lg"
                                />
                                {item.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </TabPanel>
                ))}
              </TabPanels>
            </TabGroup>
          </DialogPanel>
        </div>
      </Dialog>

      {/* lap menu */}
      <header className="fixed inset-x-0 top-0 z-50  bg-white dark:bg-black dark:text-white border-b-2 border-[#ffc107ff] ">
        <p className="flex h-10 items-center justify-center bg-[#ffc107ff] px-4 text-sm font-medium text-white sm:px-6 lg:px-8">
          First order? Use code FIRST-10 & get 10% OFF
        </p>

        <nav
          aria-label="Top"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-white dark:bg-black dark:text-white">
          <div className="">
            <div className="flex h-16 items-center">
              <button
                type="button"
                onClick={() => setOpen(true)}
                className="relative rounded-md bg-white dark:bg-black p-2 text-gray-400 lg:hidden ">
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon aria-hidden="true" className="h-6 w-6" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <Link href="/">
                  <Image
                    alt=""
                    src="https://99customizedjewellery.com/wp-content/uploads/2022/01/jewel_logo.png"
                    className="h-8 w-32 sm:w-24 md:w-28 lg:w-32"
                    width={100}
                    height={100}
                  />
                </Link>
              </div>

              {/* Flyout menus */}
              <PopoverGroup className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {navigation.categories.map((category) => (
                    <Popover key={category.name} className="flex">
                      <div className="relative flex">
                        <PopoverButton
                          className="relative z-40 -mb-px flex items-center border-b-2 border-transparent 
             pt-px text-sm font-medium text-gray-700 transition-colors duration-200 ease-out 
             hover:text-[#e8126aff] data-[open]:border-[#e8126aff] data-[open]:text-[#e8126aff]">
                          {category.name}
                        </PopoverButton>
                      </div>

                      <PopoverPanel
                        transition
                        className="absolute inset-x-0 top-full text-sm text-gray-500 transition
                         data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out 
                         data-[leave]:ease-in z-40">
                        <div
                          aria-hidden="true"
                          className="absolute inset-0 top-1/2 bg-white shadow"
                        />
                      </PopoverPanel>
                    </Popover>
                  ))}
                </div>
              </PopoverGroup>

              {/* Laptop Search-bar */}
              <div
                ref={desktopSearchRef}
                className="hidden sm:block relative w-full max-w-md mx-auto px-2">
                <input
                  type="text"
                  placeholder="Search Your Dream Product's..."
                  className="w-full rounded-full border border-yellow-300 py-2.5 px-5 shadow-sm sm:text-sm hover:border-[#e8126aff] focus:border-[#e8126aff]"
                  value={desktopSearchQuery}
                  onChange={(e) => setDesktopSearchQuery(e.target.value)}
                />
                <span className="absolute inset-y-0 end-0 grid w-10 place-content-center mx-5">
                  <button
                    type="button"
                    className="text-gray-600 hover:text-gray-700">
                    <span className="sr-only">Search</span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-6">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                      />
                    </svg>
                  </button>
                </span>

                {/* Desktop search results */}
                {desktopSearchResults.length > 0 ? (
                  <ul className="absolute top-full left-0 w-full bg-black text-white mt-2 p-2 max-h-96 overflow-y-auto">
                    {desktopSearchResults.slice(0, 5).map((product) => (
                      <li
                        key={product._id}
                        className="p-4 border-b border-[#ffc107ff] flex flex-col md:flex-row items-start">
                        <Link
                          href={{
                            pathname: "/product-category",
                            query: { p: encryptId(product.productId) },
                          }}
                          className="flex flex-col md:flex-row items-start w-full"
                          onClick={() => {
                            setDesktopSearchQuery(""); // Clear search query
                            setDesktopSearchResults([]); // Clear search results
                          }}>
                          <div className="flex items-center">
                            <Image
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-cover mr-10"
                              width={100}
                              height={100}
                            />
                            <div className="flex gap-2">
                              <div>
                                <h2 className="text-lg font-bold">
                                  {product.name}
                                </h2>
                                <p className="text-gray-600">
                                  Price: ₹ {product.price}
                                </p>
                              </div>
                              <div>
                                {product.oldPrice && (
                                  <p className="text-gray-400 line-through">
                                    Old Price: ₹ {product.oldPrice}
                                  </p>
                                )}
                                <p className="text-sm">{product.description}</p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : desktopSearchQuery.length >= 3 ? (
                  <p className="absolute bg-black w-full text-center mt-2 text-white rounded-lg p-1">
                    🛒 No products found.
                  </p>
                ) : null}
              </div>

              {/* mobile navbar  */}
              <div className="ml-auto flex items-center gap-2">
                <div className="hidden sm:block">
                  {!session ? (
                    <div className="px-4 py-6 ">
                      <Link href="/auth" className="-m-2 flex items-center p-2">
                        <UserCircleIcon className="h-6 w-6 bg-white dark:bg-black dark:text-white flex-shrink-0" />
                        <span className="ml-3 block text-base font-medium bg-white dark:bg-black dark:text-white">
                          USER
                        </span>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      {role === "admin" && (
                        <div className="container flex items-center justify-between p-4">
                          <Link
                            href="/dashboard/admin"
                            className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-black dark:text-white
                             border border-gray-300 hover:bg-red-100">
                            <div className="">
                              <Image
                                src={session.user.image}
                                alt={`${session.user.name}'s profile picture`}
                                width={30}
                                height={30}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="ml-4 text-center">
                              <p className="text-lg font-semibold">
                                {session.user.name}
                              </p>
                            </div>
                          </Link>
                        </div>
                      )}

                      {role === "employee" && (
                        <div className="container flex items-center justify-between p-4">
                          <Link
                            href="/dashboard/employee"
                            className="flex items-center justify-center p-2 rounded-full bg-white dark:bg-black dark:text-white border border-gray-300 hover:bg-red-100">
                            <div className="">
                              <Image
                                src={session.user.image}
                                alt={`${session.user.name}'s profile picture`}
                                width={30}
                                height={30}
                                className="rounded-full object-cover"
                              />
                            </div>
                            <div className="ml-4 text-center">
                              <p className="text-lg font-semibold">
                                {session.user.name}
                              </p>
                            </div>
                          </Link>
                        </div>
                      )}

                      {role === "visitor" && (
                        <div className="container flex items-center justify-between p-4">
                          <Link
                            href="/dashboard/visitor"
                            className="flex items-center justify-center p-2 rounded-full
                             bg-white dark:bg-black dark:text-white border border-gray-300 hover:bg-red-100">
                            <div className="">
                              <Image
                                src={session.user.image}
                                alt={`${session.user.name}'s profile picture`}
                                width={1000}
                                height={1000}
                                className="rounded-full object-cover w-100 h-12 sm:w-32 sm:h-100 md:w-12 md:h-10"
                              />
                            </div>
                            <div className="ml-4 text-center hidden sm:block">
                              <p className="">{session.user.name}</p>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dark Mode Toggle Button */}
                <label className="theme-switch cursor-pointer hidden sm:block ">
                  <input
                    type="checkbox"
                    className="theme-switch__checkbox"
                    checked={isDark} // Set checkbox based on theme
                    onChange={() => setTheme(isDark ? "light" : "dark")} // Toggle theme
                  />
                  <div className="theme-switch__container">
                    <div className="theme-switch__clouds"></div>
                    <div className="theme-switch__stars-container">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 144 55"
                        fill="none">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M135.831 3.00688C135.055 3.85027 134.111 4.29946 133 4.35447C134.111 4.40947 135.055 4.85867 135.831 5.71123C136.607 6.55462 136.996 7.56303 136.996 8.72727C136.996 7.95722 137.172 7.25134 137.525 6.59129C137.886 5.93124 138.372 5.39954 138.98 5.00535C139.598 4.60199 140.268 4.39114 141 4.35447C139.88 4.2903 138.936 3.85027 138.16 3.00688C137.384 2.16348 136.996 1.16425 136.996 0C136.996 1.16425 136.607 2.16348 135.831 3.00688ZM31 23.3545C32.1114 23.2995 33.0551 22.8503 33.8313 22.0069C34.6075 21.1635 34.9956 20.1642 34.9956 19C34.9956 20.1642 35.3837 21.1635 36.1599 22.0069C36.9361 22.8503 37.8798 23.2903 39 23.3545C38.2679 23.3911 37.5976 23.602 36.9802 24.0053C36.3716 24.3995 35.8864 24.9312 35.5248 25.5913C35.172 26.2513 34.9956 26.9572 34.9956 27.7273C34.9956 26.563 34.6075 25.5546 33.8313 24.7112C33.0551 23.8587 32.1114 23.4095 31 23.3545ZM0 36.3545C1.11136 36.2995 2.05513 35.8503 2.83131 35.0069C3.6075 34.1635 3.99559 33.1642 3.99559 32C3.99559 33.1642 4.38368 34.1635 5.15987 35.0069C5.93605 35.8503 6.87982 36.2903 8 36.3545C7.26792 36.3911 6.59757 36.602 5.98015 37.0053C5.37155 37.3995 4.88644 37.9312 4.52481 38.5913C4.172 39.2513 3.99559 39.9572 3.99559 40.7273C3.99559 39.563 3.6075 38.5546 2.83131 37.7112C2.05513 36.8587 1.11136 36.4095 0 36.3545ZM56.8313 24.0069C56.0551 24.8503 55.1114 25.2995 54 25.3545C55.1114 25.4095 56.0551 25.8587 56.8313 26.7112C57.6075 27.5546 57.9956 28.563 57.9956 29.7273C57.9956 28.9572 58.172 28.2513 58.5248 27.5913C58.8864 26.9312 59.3716 26.3995 59.9802 26.0053C60.5976 25.602 61.2679 25.3911 62 25.3545C60.8798 25.2903 59.9361 24.8503 59.1599 24.0069C58.3837 23.1635 57.9956 22.1642 57.9956 21C57.9956 22.1642 57.6075 23.1635 56.8313 24.0069ZM81 25.3545C82.1114 25.2995 83.0551 24.8503 83.8313 24.0069C84.6075 23.1635 84.9956 22.1642 84.9956 21C84.9956 22.1642 85.3837 23.1635 86.1599 24.0069C86.9361 24.8503 87.8798 25.2903 89 25.3545C88.2679 25.3911 87.5976 25.602 86.9802 26.0053C86.3716 26.3995 85.8864 26.9312 85.5248 27.5913C85.172 28.2513 84.9956 28.9572 84.9956 29.7273C84.9956 28.563 84.6075 27.5546 83.8313 26.7112C83.0551 25.8587 82.1114 25.4095 81 25.3545ZM136 36.3545C137.111 36.2995 138.055 35.8503 138.831 35.0069C139.607 34.1635 139.996 33.1642 139.996 32C139.996 33.1642 140.384 34.1635 141.16 35.0069C141.936 35.8503 142.88 36.2903 144 36.3545C143.268 36.3911 142.598 36.602 141.98 37.0053C141.372 37.3995 140.886 37.9312 140.525 38.5913C140.172 39.2513 139.996 39.9572 139.996 40.7273C139.996 39.563 139.607 38.5546 138.831 37.7112C138.0551 36.8587 137.111 36.4095 136 36.3545ZM101.831 49.0069C101.055 49.8503 100.111 50.2995 99 50.3545C100.111 50.4095 101.055 50.8587 101.831 51.7112C102.607 52.5546 102.996 53.563 102.996 54.7273C102.996 53.9572 103.172 53.2513 103.525 52.5913C103.886 51.9312 104.372 51.3995 104.98 51.0053C105.598 50.602 106.268 50.3911 107 50.3545C105.88 50.2903 104.936 49.8503 104.16 49.0069C103.384 48.1635 102.996 47.1642 102.996 46C102.996 47.1642 102.607 48.1635 101.831 49.0069Z"
                          fill="currentColor"></path>
                      </svg>
                    </div>
                    <div className="theme-switch__circle-container">
                      <div className="theme-switch__sun-moon-container">
                        <div className="theme-switch__moon">
                          <div className="theme-switch__spot"></div>
                          <div className="theme-switch__spot"></div>
                          <div className="theme-switch__spot"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </label>
                {/* mobile search-bar */}
                <div className="relative" ref={mobileSearchRef}>
                  <div
                    className="flex items-center bg-white
                     dark:bg-black rounded-md p-2 sm:hidden"
                    onClick={() => setShowMobileSearch(!showMobileSearch)}>
                    <MagnifyingGlassIcon className="w-6 h-6 text-gray-500" />
                  </div>

                  {showMobileSearch && (
                    <div className="absolute top-14 left-1/2 transform -translate-x-[80%] w-80 z-50 md:hidden lg:hidden">
                      <input
                        type="text"
                        id="MobileSearch"
                        placeholder="Search Your Dream Product's..."
                        className="w-full rounded-full border border-yellow-300 py-1.5 px-5 shadow-sm sm:text-sm hover:border-[#e8126aff] focus:border-[#e8126aff] active:border-[#e8126aff]"
                        value={mobileSearchQuery}
                        onChange={(e) => setMobileSearchQuery(e.target.value)}
                      />

                      <div className="mt-1">
                        {mobileSearchResults.length > 0 ? (
                          <ul className="list-none p-0 max-h-56 overflow-y-auto bg-black">
                            {mobileSearchResults.slice(0, 5).map((product) => (
                              <li
                                key={product._id}
                                className="p-2 border-b border-[#ffc107ff] flex items-start">
                                <Link
                                  href={{
                                    pathname: "/product-category",
                                    query: { p: encryptId(product.productId) },
                                  }}
                                  className="flex items-start w-full"
                                  onClick={() => {
                                    setMobileSearchQuery("");
                                    setMobileSearchResults([]);
                                    setShowMobileSearch(false);
                                  }}>
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-12 h-12 object-cover mr-4"
                                    width={50}
                                    height={50}
                                  />
                                  <div>
                                    <h2 className="text-sm font-bold">
                                      {product.name}
                                    </h2>
                                    <p className="text-gray-600 text-xs">
                                      Price: ₹ {product.price}
                                    </p>
                                    {product.oldPrice && (
                                      <p className="text-gray-400 line-through text-xs">
                                        Old Price: ₹ {product.oldPrice}
                                      </p>
                                    )}
                                    <p className="text-xs">
                                      {product.description}
                                    </p>
                                  </div>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        ) : mobileSearchQuery.length >= 3 ? (
                          <p className="bg-black mt-15 text-black dark:text-white  text-center">
                            🛒 No products found.
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>

                {/* Cart */}
                <div className="ml-4 flow-root lg:ml-6">
                  <Link
                    href={
                      session?.user?.email
                        ? session.user.role === "admin"
                          ? "/dashboard/admin"
                          : "/dashboard/visitor"
                        : "/auth"
                    }
                    className="group -m-2 flex items-center p-2">
                    <ShoppingBagIcon
                      aria-hidden="true"
                      className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 dark:text-[#ffc107ff] ">
                      {session?.user?.email ? productData.length : 0}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}

// Debounce function to delay search execution
const debounce = (func, delay) => {
  let timeout;
  return (...args) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

const UserDashboardLink = ({ href, session }) => (
  <Link href={href}>
    <div className="flex flex-col items-center justify-center bg-white dark:bg-black dark:text-white cursor-pointer">
      <div className="flex flex-col justify-center items-center p-2">
        <Image
          src={session.user.image}
          alt={`${session.user.name}'s profile picture`}
          width={70}
          height={70}
          className="rounded-full object-cover ms-5"
        />
      </div>
      <div className="ml-4 text-center">
        <p className="text-sm font-semibold">{session.user.name}</p>
        <p className="text-sm font-semibold text-[#ffc107ff]">
          {session.user.email}
        </p>
      </div>
    </div>
  </Link>
);
