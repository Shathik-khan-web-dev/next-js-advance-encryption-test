"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import "./homeComponents.css";

const Trending = () => {
  const router = useRouter();

  const handleCategoryClick = (category) => {
    router.push(`/products?category=${category}`);
  };

  return (
    <div className="mx-auto  shadow-lg top-shadow shadow-gray-700 rounded-lg  mt-5">
      <div className="text-center py-5">
        <h5>
          <span className="font-bold">🔥Trending</span>
        </h5>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="flex flex-row gap-2 md:justify-center flex-nowrap">
          {/* Column 1 */}
          <div className="flex flex-col pb-2 flex-shrink-0">
            <div className="flex gap-2 justify-end flex-nowrap">
              <div
                className="relative "
                onClick={() => handleCategoryClick("men-tshirt")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/first-grid-e.jpg&width=200&cfcache=all"
                  alt="Men's Clothing"
                  className="all_categories_img "
                  height={307}
                  width={120}
                />
                <div className="catName text-black  ">Men&apos;s Clothing</div>
              </div>

              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative "
                  onClick={() => handleCategoryClick("women-tshirt")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/Grid_Girl.jpg&width=200&cfcache=all"
                    alt="Women's Clothing"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">
                    Women&apos;s Clothing
                  </div>
                </div>

                <div
                  className="relative"
                  onClick={() => handleCategoryClick("tote-bags")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/07/tote_bag_grid.jpg&width=200&cfcache=all"
                    alt="Tote Bags"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Tote Bags</div>
                </div>
              </div>

              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("kids-clothing")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/07/grid2.jpg&width=200&cfcache=all"
                    alt="Kid's Clothing"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Kid&apos;s Clothing</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("drink-ware")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/sipper_grid-1.jpg&width=200&cfcache=all"
                    alt="Drinkware"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Drinkware</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("caps")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/grid_cap.jpg&width=200&cfcache=all"
                    alt="Caps"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Caps</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("coasters")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/coaster.jpg&width=200&cfcache=all"
                    alt="Coasters"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Coasters</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-nowrap mt-2 justify-end">
              <div
                className="relative"
                onClick={() => handleCategoryClick("cushions")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/Cushion.jpg&width=200&cfcache=all"
                  alt="Cushions"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">Cushions</div>
              </div>
              <div
                className="relative"
                onClick={() => handleCategoryClick("canvas")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/canvas.jpg&width=200&cfcache=all"
                  alt="Canvas"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">Canvas</div>
              </div>
              <div
                className="relative"
                onClick={() => handleCategoryClick("diaries")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/diary-a.jpg&width=200&cfcache=all"
                  alt="Diaries"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">Diaries</div>
              </div>
              <div
                className="relative"
                onClick={() => handleCategoryClick("mouse-pads")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/mousepad-a.jpg&width=200&cfcache=all"
                  alt="MousePads"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">MousePads</div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col pb-3 flex-shrink-0">
            <div className="flex gap-2 flex-nowrap">
              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative "
                  onClick={() => handleCategoryClick("phone-case")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/phone-case.jpg&width=200&cfcache=all"
                    alt="Phone Cases"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Phone Cases</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("clocks")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/wall-clock.jpg&width=200&cfcache=all"
                    alt="Clocks"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Clocks</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("notebooks")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/notebook.jpg&width=200&cfcache=all"
                    alt="Notebooks"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Notebooks</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("playing-cards")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/playing-card.jpg&width=200&cfcache=all"
                    alt="Playing Cards"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Playing Cards</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("pens")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/pens.jpg&width=200&cfcache=all"
                    alt="Pens"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Pens</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("caricatures")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/carricature.jpg&width=200&cfcache=all"
                    alt="Caricatures"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Caricatures</div>
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-nowrap">
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("calenders")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/table-calander.jpg&width=200&cfcache=all"
                    alt="Pens"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Calenders</div>
                </div>
                <div
                  className="relative"
                  onClick={() => handleCategoryClick("aprons")}>
                  <Image
                    src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/apron.jpg&width=200&cfcache=all"
                    alt="Caricatures"
                    className="all_categories_img"
                    height={150}
                    width={120}
                  />
                  <div className="catName text-black">Aprons</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-nowrap mt-2 justify-end">
              <div
                className="relative"
                onClick={() => handleCategoryClick("bags")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bagpacks-b.jpg&width=200&cfcache=all"
                  alt="Bags"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">Bags</div>
              </div>
              <div
                className="relative "
                onClick={() => handleCategoryClick("customized-jewelry")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/jewellery.jpg&width=200&cfcache=all"
                  alt="Customized Jewelry"
                  className="all_categories_img"
                  height={150}
                  width={120}
                />
                <div className="catName text-black">Customized Jewelry</div>
              </div>
              <div
                className="relative"
                onClick={() => handleCategoryClick("visiting-cards")}>
                <Image
                  src="https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/v-card.jpg&width=400&cfcache=all"
                  alt="Visiting Cards"
                  className="all_categories_img"
                  height={150}
                  width={248}
                />
                <div className="catName text-black">Visiting Cards</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
