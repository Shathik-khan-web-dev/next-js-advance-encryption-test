"use client";

import { useState } from "react";
import {
  Dialog,
  Disclosure,
  DisclosureButton,
  DialogPanel,
  DisclosurePanel,
} from "@headlessui/react";
import {
  XMarkIcon,
  ChevronDownIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { getRelatedMessage } from "../../utils/breadMessages"; // Adjust the path based on your structure

const filters = [
  /*     {
    id: "color",
    name: "Color",
    options: [
      { value: "white", label: "White" },
      { value: "beige", label: "Beige" },
      { value: "blue", label: "Blue" },
    ],
  },  */
  {
    id: "category",
    name: "Category",
    options: [
      // { value: "all-products", label: "All Products" },
      // { value: "new-arrivals", label: "New Arrivals" },
      { value: "chain", label: "Chain" },
      { value: "phone-case", label: "Phone Case" },
      { value: "men-tshirt", label: "Men T-shirt" },
      { value: "women-tshirt", label: "Women T-shirt" },
    ],
  },
  {
    id: "price",
    name: "Price Range",
    options: [
      { value: "200-300", label: "₹ 200 - ₹ 300" },
      { value: "400-500", label: "₹ 400 - ₹ 500" },
      { value: "1000-5000", label: "₹ 1000 - ₹ 5000" },
    ],
  },
];

export default function ProductsLayout({
  children,
  setSelectedPriceRange,
  setSelectedCategory,
}) {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]); // Only one price range allowed
  const [selectedProductCategory, setSelectedProductCategory] = useState([]);

  // Handle category change (multiple selections allowed)
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    let updatedCategories = [...selectedProductCategory];

    if (e.target.checked) {
      updatedCategories.push(value);
    } else {
      updatedCategories = updatedCategories.filter(
        (category) => category !== value
      );
    }

    setSelectedProductCategory(updatedCategories);

    if (updatedCategories.length === 0) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(updatedCategories.join(","));
    }
    // setMobileFiltersOpen(false);
  };

  // Handle price range change (only one price range allowed, toggle logic added)
  const handlePriceChange = (e) => {
    const value = e.target.value;

    if (selectedPriceRanges.includes(value)) {
      // If the price range is already selected, uncheck it
      setSelectedPriceRanges([]);
      setSelectedPriceRange(null); // clear the price range
    } else {
      // Set only the selected price range and remove any previous selections
      setSelectedPriceRanges([value]);
      setSelectedPriceRange(value);
    }

    // Close the mobile filters sidebar after selection
    setMobileFiltersOpen(false);
  };

  return (
    <div className="bg-white dark:bg-black dark:text-white mb-32">
      {/* Mobile filter dialog */}
      <Dialog
        open={mobileFiltersOpen}
        onClose={setMobileFiltersOpen}
        className="relative z-50 lg:hidden">
        <div className="fixed inset-0 flex">
          <DialogPanel
            className="relative ml-auto flex h-full w-52 max-w-xs flex-col overflow-y-auto bg-white
           dark:bg-black py-4 pb-6 shadow-xl border-l border-[#ffc107ff]">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium dark:text-white">Filters</h2>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="relative -mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500">
                <span className="sr-only dark:text-white">Close menu</span>
                <XMarkIcon aria-hidden="true" className="h-6 w-6" />
              </button>
            </div>

            {/* Filters */}
            <form className="mt-4 z-50">
              {filters.map((section) => (
                <Disclosure
                  as="div"
                  key={section.name}
                  className="border-t border-gray-200 py-4"
                  defaultOpen={true}>
                  <fieldset>
                    <legend className="w-full px-2">
                      <DisclosureButton className="group flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {section.name}
                        </span>
                        <span className="ml-6 flex h-7 items-center">
                          <ChevronDownIcon className="h-5 w-5 rotate-0 transform group-open:-rotate-180" />
                        </span>
                      </DisclosureButton>
                    </legend>
                    <DisclosurePanel className="px-4 pb-2 pt-4">
                      <div className="space-y-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              defaultValue={option.value}
                              id={`${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={
                                section.id === "category"
                                  ? selectedProductCategory.includes(
                                      option.value
                                    )
                                  : selectedPriceRanges.includes(option.value) // Only one price range allowed
                              }
                              onChange={
                                section.id === "category"
                                  ? handleCategoryChange
                                  : handlePriceChange
                              }
                            />
                            <label
                              htmlFor={`${section.id}-${optionIdx}`}
                              className="ml-3 text-sm text-gray-500">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </DisclosurePanel>
                  </fieldset>
                </Disclosure>
              ))}
            </form>
          </DialogPanel>
        </div>
      </Dialog>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200 pb-3 pt-24">
          <ol className="flex items-center space-x-4 py-4">
            <li>
              <Link
                href="/"
                className="mr-1 text-sm font-bold text-gray-900 dark:text-white">
                Home
              </Link>
              <span style={{ color: "#e8126aff" }}> &gt; </span>{" "}
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {category || "All Products"}
              </span>
            </li>
          </ol>
          <p className="text-base text-gray-500">
            {getRelatedMessage(category)}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-6">
          <aside className="">
            <h2 className="sr-only">Filters</h2>
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="inline-flex items-center lg:hidden bg-[#ffc107ff] p-1 mt-3">
              <span className="text-sm font-medium text-gray-700">Filters</span>
              <PlusIcon
                aria-hidden="true"
                className="ml-1 h-5 w-5 flex-shrink-0 text-gray-700"
              />
            </button>

            <div className="hidden lg:block z-50">
              <form className="space-y-10 divide-y divide-gray-200">
                {filters.map((section) => (
                  <div key={section.name}>
                    <fieldset>
                      <legend className="block text-sm font-medium text-gray-900 dark:text-white pt-5">
                        {section.name}
                      </legend>
                      <div className="space-y-3 pt-6">
                        {section.options.map((option, optionIdx) => (
                          <div key={option.value} className="flex items-center">
                            <input
                              defaultValue={option.value}
                              id={`${section.id}-${optionIdx}`}
                              name={`${section.id}[]`}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              checked={
                                section.id === "category"
                                  ? selectedProductCategory.includes(
                                      option.value
                                    )
                                  : selectedPriceRanges.includes(option.value)
                              }
                              onChange={
                                section.id === "category"
                                  ? handleCategoryChange
                                  : handlePriceChange
                              }
                            />
                            <label
                              htmlFor={`${section.id}-${optionIdx}`}
                              className="ml-3 text-sm text-gray-600">
                              {option.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                ))}
              </form>
            </div>
          </aside>

          <section className="lg:col-span-5 min-h-screen">{children}</section>
        </div>
      </main>
    </div>
  );
}
