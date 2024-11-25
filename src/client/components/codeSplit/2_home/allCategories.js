"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./homeComponents.css";
import toast, { Toaster } from "react-hot-toast";

const AllCategories = () => {
  const [activeCategory, setActiveCategory] = useState("Apparels");

  const categories = [
    "Apparels",
    "Phone Accessories",
    "Home & Kitchen",
    "Mugs & Sippers",
    "Stationery",
    "Gifts & Accessories",
    "Office Supplies",
    "Pet Accessories",
    "Packaging Material",
  ];

  const categoryTopData = {
    Apparels: {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/clothing.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/mens-hoodie.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bagpacks-b.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/muffler.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/shoes.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/travel-kit.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/passport-holder1.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/sleeping-mask.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/belt.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/face-mask.jpg&width=166&cfcache=all",
      ],
      label: [
        "Clothing",
        "Hoodies",
        "Bags",
        "Mufflers",
        "Shoes",
        "Travel Kits",
        "Passport Holders",
        "Sleeping Masks",
        "Belts",
        "Face Masks",
      ],
    },
    "Phone Accessories": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/phone-case.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/airpods-1.jpg&width=166&cfcache=all",
      ],
      label: ["Phone Covers", "Air Pod Case"],
    },
    "Home & Kitchen": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/Cushion.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/LED-frame.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/dinnner-plate-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/apron.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/poster-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/coaster.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/wooden-frame.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/01/Neon.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2022/02/cat-01.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/fabrics.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/toys.jpg&width=166&cfcache=all",
      ],
      label: [
        "Cushions",
        "LED Frames",
        "Dinner Plates",
        "Aprons",
        "Poster",
        "Coaster",
        "Engraved Frames",
        "Neon Signs",
        "Key Hangers",
        "Fabrics",
        "Toys",
      ],
    },
    "Mugs & Sippers": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/mugs-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/bottle.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/shot-glass.jpg&width=166&cfcache=all",
      ],
      label: ["Mugs", "Slipper Bottles", "Shot Glasses"],
    },
    Stationery: {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/table-calander.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/playing-card.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/lettterhead.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/canvas.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/button-badges-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/sticker.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/geometry-box.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/v-card-holder.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/paper-weight-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/greeting-card.jpg&width=166&cfcache=all",
        ,
      ],
      label: [
        "Calendars",
        "Playing Cards",
        "Letterheads",
        "Photo Canvas",
        "Button Badges",
        "Stickers",
        "Geometry Box",
        "Visiting Card holders",
        "Paper Weight",
        "Greeting Cards",
      ],
    },
    "Gifts & Accessories": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/carricature.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bagpacks-b.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/jewellery.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/jigsaw-puzzle-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/car-hanging-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/toys.jpg&width=166&cfcache=all",
      ],
      label: [
        "Caricatures",
        "Bags",
        "Jewelry",
        "Jigsaw Puzzles",
        "Car Hangings",
        "Toys",
      ],
    },
    "Office Supplies": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/card-pendrive-b.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/mousepad-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/button-badges-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/pens.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/geometry-box.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/pen-box-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/paper-weight-a.jpg&width=166&cfcache=all",
      ],
      label: [
        "Pen Drives",
        "Mouse Pads",
        "Button Badges",
        "Pens",
        "Geometry Box",
        "Pen Box",
        "Paper Weights",
      ],
    },
    "Pet Accessories": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2022/02/pet_acc_cat.jpg&width=166&cfcache=all",
      ],
      label: ["Pet Accessories"],
    },
    "Packaging Material": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/pod-bags.jpg&width=166&cfcache=all",
      ],
      label: ["Courier Bags"],
    },
  };

  const categoryBottomData = {
    Apparels: {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/mens-t-shirt-1.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/08/grid_cap.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/apron.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/jewellery.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/headband.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/wallet.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/watch-strap.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/socks.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bathrobs_1.jpg&width=166&cfcache=all",
      ],
      label: [
        "T-Shirts",
        "Caps",
        "Aprons",
        "Jewelry",
        "Head bands",
        "Wallets",
        "Watch Bands",
        "Socks",
        "Bathrobes",
      ],
    },
    "Phone Accessories": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/pop-socket.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/phone-holder.jpg&width=166&cfcache=all",
      ],
      label: ["Phone Grips", "Mobile Phone Stand"],
    },
    "Home & Kitchen": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/bedsheet.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/photo-frames.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/fridge-magnet.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/canvas.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/pillow.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/curtain.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/jigsaw-puzzle-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/tiffin-box-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/name-plate-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/door-hanger-1.jpg&width=166&cfcache=all",
      ],
      label: [
        "Bed Sheets",
        "Photo frames",
        "Fridge Photo Magnets",
        "Photo Canvas",
        "Pillow Covers",
        "Curtains",
        "Jigsaw puzzles",
        "Tiffin Boxes",
        "Name Plates",
        "Door Hangers",
      ],
    },
    "Mugs & Sippers": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/beer-mug.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2022/11/Tumbler.jpg&width=166&cfcache=all",
      ],
      label: ["Beer Mugs", "Tumblers"],
    },
    Stationery: {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/v-card-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/notebook.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/notepad-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/poster-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/diary-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/presentation-folder.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/standee-1.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/examboard-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2024/03/Bookmark-Categories-1.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2024/06/Loyalty-cards.jpg&width=166&cfcache=all",
      ],
      label: [
        "Visiting Cards",
        "Notebooks",
        "Notepads",
        "posters",
        "Diaries",
        "Folders",
        "Banner Standees",
        "Exam Boards",
        "Bookmarks",
        "Loyalty Cards",
        "",
      ],
    },
    "Gifts & Accessories": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/keychain-b.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/greeting-card.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/magic-mirror-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2022/02/wbcat.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/pocket-mirror-b.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2024/07/Rakhi-Sub-category.jpg&width=166&cfcache=all",
      ],
      label: [
        "Keychains",
        "Greeting Cards",
        "Magic Mirrors",
        "Wrist Bands",
        "Pocket Mirrors",
        "Photo Rakhi",
      ],
    },
    "Office Supplies": {
      img: [
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/wall-clock.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/stamp.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/pen-stand.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/diary-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/standee-1.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/10/examboard-a.jpg&width=166&cfcache=all",
        "https://www.yourprint.in/new-admin-ajax.php?action=resize_outer_image&url=https://www.yourprint.in/wp-content/uploads/2023/09/door-hanger-1.jpg&width=166&cfcache=all",
      ],
      label: [
        "Clocks",
        "Stamps",
        "Pen Stands",
        "Diaries",
        "Banner Standees",
        "Exam Boards",
        "Door Hangers",
      ],
    },
  };

  const handleImageClick = () => {
    toast.error(" Check 🔥Trending");
  };

  return (
    <div className="mx-auto shadow-lg top-shadow shadow-gray-700 rounded-lg my-9 px-5 pb-3">
      <div className="text-center py-3">
        <h5 className="text-lg font-semibold">
          <span>☰ All Categories</span>
        </h5>
      </div>

      <div className="flex text-center space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <span
            key={category}
            className={`category text-xs sm:text-sm md:text-base lg:text-lg ${
              activeCategory === category ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category)}>
            {category}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto mt-3">
        <div className="flex flex-nowrap">
          <div className="flex flex-col space-y-2 flex-shrink-0 w-max">
            <div className="flex gap-2">
              {categoryTopData[activeCategory] &&
                categoryTopData[activeCategory].img.map((src, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex flex-col gap-2">
                    <div className="relative">
                      <Image
                        src={src}
                        alt={categoryTopData[activeCategory].label[index]}
                        height={135}
                        width={100}
                        className="w-28 h-36 object-cover rounded-md"
                        onClick={handleImageClick}
                      />
                      <div className="catName text-black">
                        {categoryTopData[activeCategory].label[index]}
                      </div>
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex gap-2 mt-2">
              {categoryBottomData[activeCategory] &&
                categoryBottomData[activeCategory].img.map((src, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 flex flex-col gap-2">
                    <div className="relative">
                      <Image
                        src={src}
                        alt={categoryBottomData[activeCategory].label[index]}
                        height={135}
                        width={100}
                        className="w-28 h-36 object-cover rounded-md"
                        onClick={handleImageClick}
                      />
                      <div className="catName text-black">
                        {categoryBottomData[activeCategory].label[index]}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            top: "100px",
            background: "#000",
            color: "#fff",
          },
        }}
      />
    </div>
  );
};

export default AllCategories;
